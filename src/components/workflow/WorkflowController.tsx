import React, { useState } from 'react';
import UploadStep from './UploadStep';
import ProcessingStep from './ProcessingStep';
import ScriptReviewStep from './ScriptReviewStep';
import PodcastGeneration from '../content/PodcastGeneration';
import VideoGenerationStep from './VideoGenerationStep';
import DownloadStep from './DownloadStep';
import StatusIndicator from './StatusIndicator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type WorkflowStep = 'upload' | 'processing' | 'scriptReview' | 'audio' | 'video' | 'download';

const WorkflowController: React.FC = () => {
  const [step, setStep] = useState<WorkflowStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [script, setScript] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Väntar på uppladdning');
  const [projectId, setProjectId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpload = async (uploadedFile: File) => {
    try {
      setFile(uploadedFile);
      setStatus('Skapar projekt...');
      setStep('processing');

      // Create a new project in Supabase with demo user ID
      const demoUserId = '00000000-0000-0000-0000-000000000000'; // Demo UUID for anonymous users
      
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: `Demo: ${uploadedFile.name}`,
          description: 'Demo workflow project',
          status: 'processing',
          user_id: demoUserId // Add demo user ID for RLS-disabled demo
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

      setStatus('Extraherar PDF innehåll...');

      // First extract PDF content
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

      setStatus('Bearbetar dokument med AI...');

      // Now call AI analysis with the extracted text content
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-financial-data', {
        body: {
          projectId: project.id,
          pdfText: extractionData.content // Pass the extracted text content
        }
      });

      if (analysisError) {
        throw new Error(`AI-analys misslyckades: ${analysisError.message}`);
      }

      if (!analysisData?.success) {
        throw new Error(`AI-analys fel: ${analysisData?.error || 'Okänt fel'}`);
      }

      // Check data quality and handle script generation accordingly
      if (analysisData.data_quality === 'low' || analysisData.scripts_generated === 'No') {
        // Generate a basic script from the financial data
        const basicScript = generateBasicScript(analysisData.financial_data);
        
        // Save the basic script to generated_content
        const { error: contentError } = await supabase
          .from('generated_content')
          .insert({
            project_id: project.id,
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
        setStatus('Grundläggande manus genererat (låg datakvalitet)');
        setStep('scriptReview');

        toast({
          title: "Analys slutförd med begränsningar",
          description: "Ett grundläggande manus har genererats. Dokumentet kunde inte analyseras fullt ut.",
          variant: "destructive",
        });

        return;
      }

      // Get the generated script alternatives (for high quality data)
      const { data: contentData, error: contentError } = await supabase
        .from('generated_content')
        .select('script_alternatives')
        .eq('project_id', project.id)
        .single();

      if (contentError || !contentData?.script_alternatives) {
        throw new Error('Kunde inte hämta genererat manus');
      }

      // Use the first script alternative as default
      const scriptAlternatives = contentData.script_alternatives as any[];
      const defaultScript = scriptAlternatives[0]?.script || 'Inget manus genererat';
      
      setScript(defaultScript);
      setStatus('Manus genererat och redo för granskning');
      setStep('scriptReview');

      toast({
        title: "Bearbetning Slutförd!",
        description: "Ditt dokument har analyserats och manus har genererats.",
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

  const generateBasicScript = (financialData: any): string => {
    const companyName = financialData?.company_name || 'Företaget';
    const period = financialData?.report_period || 'denna period';
    
    return `
Välkommen till en sammanfattning för ${companyName} för ${period}.

Även om vi inte kunde extrahera fullständiga finansiella detaljer från dokumentet, har vi genomfört en grundläggande analys.

Dokumentet har bearbetats och vi har identifierat att det innehåller finansiell information, men för en mer detaljerad analys skulle ett tydligare dokument eller kompletterande information vara till hjälp.

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
    
    // Skip video step and go directly to download
    setTimeout(() => {
      setStep('download');
      setStatus('Klar för nedladdning');
    }, 1000);
  };

  const handleDownload = () => {
    if (audioUrl) {
      // Create download link
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
    setScript(null);
    setAudioUrl(null);
    setVideoUrl(null);
    setProjectId(null);
    setStatus('Väntar på uppladdning');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">ReportFlow Demo Workflow</h2>
      <StatusIndicator status={status} currentStep={step} />
      
      {step === 'upload' && <UploadStep onUpload={handleUpload} />}
      {step === 'processing' && <ProcessingStep />}
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
