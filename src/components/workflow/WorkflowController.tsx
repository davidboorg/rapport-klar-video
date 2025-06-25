import React, { useState } from 'react';
import UploadStep from './UploadStep';
import ProcessingStep from './ProcessingStep';
import ScriptReviewStep from './ScriptReviewStep';
import PodcastGeneration from '../content/PodcastGeneration';
import VideoGenerationStep from './VideoGenerationStep';
import DownloadStep from './DownloadStep';
import StatusIndicator from './StatusIndicator';
import PDFTextPreview from '../pdf/PDFTextPreview';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type WorkflowStep = 'upload' | 'processing' | 'textPreview' | 'scriptReview' | 'audio' | 'video' | 'download';

const WorkflowController: React.FC = () => {
  const [step, setStep] = useState<WorkflowStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [script, setScript] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Väntar på uppladdning');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (uploadedFile: File) => {
    try {
      setFile(uploadedFile);
      setStatus('Skapar projekt...');
      setStep('processing');

      // Create a new project in Supabase
      const demoUserId = '00000000-0000-0000-0000-000000000000';
      
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: `Demo: ${uploadedFile.name}`,
          description: 'Demo workflow project',
          status: 'processing',
          user_id: demoUserId
        })
        .select()
        .single();

      if (projectError) {
        throw new Error(`Kunde inte skapa projekt: ${projectError.message}`);
      }

      setProjectId(project.id);
      setStatus('Laddar upp fil...');

      // Upload file to the documents bucket
      const fileName = `${project.id}/${uploadedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, uploadedFile);

      if (uploadError) {
        throw new Error(`Uppladdning misslyckades: ${uploadError.message}`);
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Update project with PDF URL
      const { error: updateError } = await supabase
        .from('projects')
        .update({ pdf_url: publicUrl })
        .eq('id', project.id);

      if (updateError) {
        throw new Error(`Kunde inte uppdatera projekt: ${updateError.message}`);
      }

      setStatus('Extraherar PDF innehåll med förbättrad algoritm...');

      // Extract PDF content with improved extraction
      const { data: extractionData, error: extractionError } = await supabase.functions.invoke('extract-pdf-content', {
        body: {
          pdfUrl: publicUrl,
          projectId: project.id
        }
      });

      if (extractionError) {
        throw new Error(`PDF extraktion misslyckades: ${extractionError.message}`);
      }

      if (!extractionData?.success || !extractionData?.content) {
        throw new Error(`PDF extraktion fel: ${extractionData?.error || 'Kunde inte extrahera innehåll'}`);
      }

      console.log('=== PDF EXTRACTION SUCCESS ===');
      console.log('Extracted text length:', extractionData.length);
      console.log('Word count:', extractionData.wordCount);
      console.log('Has numbers:', extractionData.hasNumbers);
      console.log('Sample text:', extractionData.sample);

      setExtractedText(extractionData.content);
      setStatus('Text extraherad - granska innan AI-generering');
      setStep('textPreview');

      toast({
        title: "PDF Extrahering Slutförd!",
        description: `${extractionData.wordCount} ord extraherade. Granska texten innan AI-generering.`,
      });

    } catch (error) {
      console.error('Upload and processing error:', error);
      setStatus(`Fel: ${error instanceof Error ? error.message : 'Okänt fel'}`);
      
      toast({
        title: "Fel uppstod",
        description: error instanceof Error ? error.message : 'Ett okänt fel uppstod',
        variant: "destructive",
      });
    }
  };

  const handleTextApprove = async (approvedText: string) => {
    if (!projectId) return;

    try {
      setIsProcessingAI(true);
      setStatus('Bearbetar text med AI...');

      console.log('=== SENDING TO AI ANALYSIS ===');
      console.log('Text length being sent:', approvedText.length);
      console.log('First 200 chars:', approvedText.substring(0, 200));

      // Call AI analysis with the approved text
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-financial-data', {
        body: {
          projectId: projectId,
          pdfText: approvedText
        }
      });

      if (analysisError) {
        throw new Error(`AI-analys misslyckades: ${analysisError.message}`);
      }

      if (!analysisData?.success) {
        throw new Error(`AI-analys fel: ${analysisData?.error || 'Okänt fel'}`);
      }

      // Check data quality and handle script generation accordingly
      if (analysisData.data_quality === 'low' || !analysisData.script_text) {
        const basicScript = generateBasicScript(analysisData.financial_data);
        
        // Save the basic script
        const { error: contentError } = await supabase
          .from('generated_content')
          .insert({
            project_id: projectId,
            script_text: basicScript,
            generation_status: 'completed',
            script_alternatives: [{
              type: 'executive',
              title: 'Grundläggande sammanfattning',
              duration: '2-3 minuter',
              script: basicScript,
              tone: 'Informativ',
              key_points: ['Dokumentanalys genomförd', 'Grundläggande information extraherad']
            }]
          });

        if (contentError) {
          console.error('Error saving basic script:', contentError);
        }

        setScript(basicScript);
        setStatus('Grundläggande manus genererat');
        setStep('scriptReview');

        toast({
          title: "Manus genererat",
          description: "Ett grundläggande manus har skapats baserat på den extraherade texten.",
        });

        return;
      }

      // Use the high-quality generated script
      setScript(analysisData.script_text);
      setStatus('Högkvalitativt manus genererat och redo för granskning');
      setStep('scriptReview');

      toast({
        title: "AI-analys Slutförd!",
        description: "Ett högkvalitativt manus har genererats från ditt dokument.",
      });

    } catch (error) {
      console.error('AI processing error:', error);
      setStatus(`AI-fel: ${error instanceof Error ? error.message : 'Okänt fel'}`);
      
      toast({
        title: "AI-bearbetning misslyckades",
        description: error instanceof Error ? error.message : 'Ett okänt fel uppstod',
        variant: "destructive",
      });
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleTextReject = () => {
    setStep('upload');
    setFile(null);
    setExtractedText('');
    setStatus('Väntar på ny PDF-uppladdning');
  };

  const generateBasicScript = (financialData: any): string => {
    const companyName = financialData?.company_name || 'Företaget';
    const period = financialData?.report_period || 'denna period';
    
    return `
Välkommen till en sammanfattning för ${companyName} för ${period}.

Även om vi inte kunde extrahera fullständiga finansiella detaljer från dokumentet, har vi genomfört en grundläggande analys av den tillgängliga texten.

Dokumentet har bearbetats och vi har identifierat innehåll som tyder på finansiell rapportering. För en mer detaljerad analys skulle ett tydligare dokument eller kompletterande information vara till hjälp.

Vi fortsätter att arbeta för att förbättra våra processer och leverera värde till våra intressenter.

Tack för er uppmärksamhet.
    `.trim();
  };

  const handleScriptApprove = async (approvedScript: string) => {
    setScript(approvedScript);
    setStatus('Redo att generera podcast med ElevenLabs');
    setStep('audio');

    toast({
      title: "Manus godkänt!",
      description: "Nu kan du generera podcast med avancerade ElevenLabs-inställningar.",
    });
  };

  const handlePodcastGenerated = (podcastUrl: string) => {
    setAudioUrl(podcastUrl);
    setStatus('Podcast genererad och redo för nedladdning');
    
    setTimeout(() => {
      setStep('download');
      setStatus('Klar för nedladdning');
    }, 1000);
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `podcast-${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setStatus('Podcast nedladdad');
      
      toast({
        title: "Nedladdning Slutförd",
        description: "Din podcast har laddats ner framgångsrikt.",
      });
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setExtractedText('');
    setScript(null);
    setAudioUrl(null);
    setVideoUrl(null);
    setProjectId(null);
    setIsProcessingAI(false);
    setStatus('Väntar på uppladdning');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">ReportFlow Demo Workflow</h2>
      <StatusIndicator status={status} currentStep={step} />
      
      {step === 'upload' && <UploadStep onUpload={handleUpload} />}
      {step === 'processing' && <ProcessingStep />}
      {step === 'textPreview' && file && extractedText && (
        <PDFTextPreview
          extractedText={extractedText}
          fileName={file.name}
          onApprove={handleTextApprove}
          onReject={handleTextReject}
          isLoading={isProcessingAI}
        />
      )}
      {step === 'scriptReview' && script && (
        <ScriptReviewStep script={script} onApprove={handleScriptApprove} />
      )}
      {step === 'audio' && script && projectId && (
        <PodcastGeneration
          projectId={projectId}
          scriptText={script}
          marketType="ir"
          onPodcastGenerated={handlePodcastGenerated}
        />
      )}
      {step === 'video' && script && (
        <VideoGenerationStep script={script} videoUrl={videoUrl} />
      )}
      {step === 'download' && (
        <DownloadStep 
          audioUrl={audioUrl} 
          videoUrl={videoUrl} 
          onDownload={handleDownload} 
          onReset={handleReset} 
        />
      )}
    </div>
  );
};

export default WorkflowController;
