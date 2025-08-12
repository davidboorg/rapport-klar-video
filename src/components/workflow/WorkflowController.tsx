import React, { useState } from 'react';
import UploadStep from './UploadStep';
import ProcessingStep from './ProcessingStep';
import ScriptReviewStep from './ScriptReviewStep';
import ScriptComparisonStep from './ScriptComparisonStep';
import PodcastGeneration from '../content/PodcastGeneration';
import DownloadStep from './DownloadStep';
import StatusIndicator from './StatusIndicator';
import PDFTextPreview from '../pdf/PDFTextPreview';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export type WorkflowStep = 'upload' | 'processing' | 'textPreview' | 'scriptReview' | 'audio' | 'download';

const WorkflowController: React.FC = () => {
  const [step, setStep] = useState<WorkflowStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [script, setScript] = useState<string | null>(null);
  const [script1, setScript1] = useState<string>('');
  const [script2, setScript2] = useState<string>('');
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

      console.log('=== STARTING ENHANCED UPLOAD PROCESS ===');
      console.log('File:', uploadedFile.name, 'Size:', uploadedFile.size);

      // Kontrollera filstorlek innan uppladdning
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (uploadedFile.size > maxSize) {
        throw new Error(`Filen är för stor (${Math.round(uploadedFile.size / 1024 / 1024)}MB, max 10MB)`);
      }

      // Validera filtyp
      if (uploadedFile.type !== 'application/pdf') {
        throw new Error('Endast PDF-filer är tillåtna');
      }

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
        console.error('Project creation error:', projectError);
        throw new Error(`Kunde inte skapa projekt: ${projectError.message}`);
      }

      console.log('Project created:', project.id);
      setProjectId(project.id);
      setStatus('Laddar upp fil...');

      // Upload file to the documents bucket (skapa bucket om den inte finns)
      const fileName = `${project.id}/${uploadedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, uploadedFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Uppladdning misslyckades: ${uploadError.message}`);
      }

      // Create a signed URL (valid for 1 hour)
      const { data: signedData, error: signedError } = await supabase.storage
        .from('documents')
        .createSignedUrl(fileName, 60 * 60);

      if (signedError || !signedData?.signedUrl) {
        console.error('Signed URL error:', signedError);
        throw new Error(`Kunde inte skapa signerad URL: ${signedError?.message || 'okänt fel'}`);
      }

      console.log('File uploaded, URL:', signedData.signedUrl);

      // Update project with PDF URL
      const { error: updateError } = await supabase
        .from('projects')
        .update({ pdf_url: signedData.signedUrl })
        .eq('id', project.id);

      if (updateError) {
        console.error('Project update error:', updateError);
        throw new Error(`Kunde inte uppdatera projekt: ${updateError.message}`);
      }

      setStatus('Extraherar PDF innehåll med förbättrade algoritmer...');

      console.log('=== CALLING ENHANCED PDF EXTRACTION ===');
      console.log('Project ID:', project.id);
      console.log('PDF URL:', signedData.signedUrl);

      // Extract PDF content med förbättrad felhantering
      const { data: extractionData, error: extractionError } = await supabase.functions.invoke('extract-pdf-content', {
        body: {
          pdfUrl: signedData.signedUrl,
          projectId: project.id
        }
      });

      console.log('=== PDF EXTRACTION RESPONSE ===');
      console.log('Raw response data:', extractionData);
      console.log('Raw response error:', extractionError);

      // Hantera Supabase function error
      if (extractionError) {
        console.error('Supabase function invocation error:', extractionError);
        
        let errorMessage = 'PDF extraktion misslyckades';
        
        // Hantera olika typer av fel
        if (extractionError.message?.includes('FunctionsHttpError')) {
          errorMessage = 'Edge Function fel - kontrollera att funktionen är deployad korrekt';
        } else if (extractionError.message?.includes('timeout')) {
          errorMessage = 'PDF-extraktion tog för lång tid - försök med en mindre PDF';
        } else if (extractionError.message) {
          errorMessage = `PDF extraktion fel: ${extractionError.message}`;
        }
        
        throw new Error(errorMessage);
      }

      // Hantera response från edge function
      if (!extractionData) {
        throw new Error('Inget svar från PDF-extraktions-tjänsten');
      }

      if (!extractionData.success) {
        console.error('PDF extraction failed with response:', extractionData);
        
        let errorMessage = 'PDF extraktion misslyckades';
        
        // Använd de nya felkoderna för bättre felmeddelanden
        switch (extractionData.code) {
          case 'INVALID_METHOD':
            errorMessage = 'Intern fel: Felaktig request-metod';
            break;
          case 'INVALID_JSON':
            errorMessage = 'Intern fel: Felaktigt dataformat eller timeout';
            break;
          case 'MISSING_PDF_URL':
            errorMessage = 'Intern fel: PDF-URL saknas';
            break;
          case 'MISSING_PROJECT_ID':
            errorMessage = 'Intern fel: Projekt-ID saknas';
            break;
          case 'DOWNLOAD_FAILED':
            errorMessage = 'Kunde inte ladda ner PDF-filen - kontrollera att filen är tillgänglig';
            break;
          case 'DOWNLOAD_ERROR':
            errorMessage = 'PDF-filen kunde inte hämtas (HTTP-fel)';
            break;
          case 'INVALID_CONTENT_TYPE':
            errorMessage = 'Filen verkar inte vara en PDF';
            break;
          case 'EMPTY_FILE':
            errorMessage = 'PDF-filen verkar vara tom eller korrupt';
            break;
          case 'FILE_TOO_LARGE':
            errorMessage = extractionData.error || 'PDF-filen är för stor (max 10MB)';
            break;
          case 'EXTRACTION_FAILED':
            errorMessage = extractionData.error || 'Kunde inte extrahera text från PDF:en';
            break;
          case 'UNEXPECTED_ERROR':
            errorMessage = 'Ett oväntat fel uppstod under PDF-bearbetning';
            break;
          default:
            errorMessage = extractionData.error || 'Okänt fel vid PDF-extraktion';
        }
        
        throw new Error(errorMessage);
      }

      if (!extractionData.content) {
        throw new Error('Ingen text kunde extraheras från PDF:en - kontrollera att det är en textbaserad PDF');
      }

      console.log('=== PDF EXTRACTION SUCCESS ===');
      console.log('Extracted text length:', extractionData.metadata?.length || extractionData.content.length);
      console.log('Word count:', extractionData.metadata?.wordCount || 'unknown');
      console.log('Processing time:', extractionData.metadata?.processingTimeMs || 'unknown', 'ms');
      console.log('File size:', extractionData.metadata?.fileSizeMB || 'unknown', 'MB');
      console.log('Has numbers:', extractionData.metadata?.hasNumbers || 'unknown');
      console.log('Has Swedish chars:', extractionData.metadata?.hasSwedishChars || 'unknown');
      console.log('Sample text:', extractionData.metadata?.sample || extractionData.content.substring(0, 100));

      setExtractedText(extractionData.content);
      setStatus('Text extraherad med förbättrade algoritmer - granska innan AI-generering');
      setStep('textPreview');

      toast({
        title: "PDF Extrahering Slutförd!",
        description: `${extractionData.metadata?.wordCount || 'Okänt antal'} ord extraherade på ${extractionData.metadata?.processingTimeMs || 'okänd'}ms med förbättrade algoritmer. Granska texten innan AI-generering.`,
      });

    } catch (error) {
      console.error('=== UPLOAD PROCESS FAILED ===');
      console.error('Error details:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Ett okänt fel uppstod';
      setStatus(`Fel: ${errorMessage}`);
      
      // Bestäm toast variant baserat på feltyp
      const isUserError = errorMessage.includes('för stor') || 
                         errorMessage.includes('inte en PDF') ||
                         errorMessage.includes('tom eller korrupt') ||
                         errorMessage.includes('Endast PDF-filer');
      
      toast({
        title: isUserError ? "Filproblem" : "Systemfel",
        description: errorMessage,
        variant: "destructive",
      });

      // Reset to upload step if there's an error
      setTimeout(() => {
        setStep('upload');
        setStatus('Väntar på uppladdning');
      }, 5000);
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
        console.error('AI analysis error:', analysisError);
        throw new Error(`AI-analys misslyckades: ${analysisError.message}`);
      }

      if (!analysisData?.success) {
        console.error('AI analysis failed:', analysisData);
        throw new Error(`AI-analys fel: ${analysisData?.error || 'Okänt fel'}`);
      }

      // Check if we got both scripts
      if (analysisData.manus1 && analysisData.manus2) {
        setScript1(analysisData.manus1);
        setScript2(analysisData.manus2);
        setStatus('Båda manusen genererade - välj ditt favoritmanus');
        setStep('scriptReview');

        toast({
          title: "AI-analys Slutförd!",
          description: "Två olika manus har genererats. Välj det som passar bäst för din presentation.",
        });
      } else if (analysisData.script_text) {
        // Fallback to single script
        setScript(analysisData.script_text);
        setStatus('Manus genererat och redo för granskning');
        setStep('scriptReview');

        toast({
          title: "Manus genererat",
          description: "Ett manus har skapats baserat på ditt dokument.",
        });
      } else {
        // Generate basic script as fallback
        const basicScript = generateBasicScript(analysisData.financial_data);
        setScript(basicScript);
        setStatus('Grundläggande manus genererat');
        setStep('scriptReview');

        toast({
          title: "Manus genererat",
          description: "Ett grundläggande manus har skapats baserat på den extraherade texten.",
        });
      }

    } catch (error) {
      console.error('AI processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Okänt fel';
      setStatus(`AI-fel: ${errorMessage}`);
      
      toast({
        title: "AI-bearbetning misslyckades",
        description: errorMessage,
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

  const handleScriptSelect = (selectedScript: string) => {
    setScript(selectedScript);
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
      {step === 'scriptReview' && (script1 || script2 || script) && (
        <>
          {script1 && script2 ? (
            <ScriptComparisonStep
              script1={script1}
              script2={script2}
              onSelectScript={handleScriptSelect}
            />
          ) : (
            <ScriptReviewStep 
              script={script || ''} 
              onApprove={handleScriptApprove} 
            />
          )}
          
          {script && (
            <div className="mt-4 flex justify-center">
              <Button 
                onClick={() => handleScriptApprove(script)}
                className="flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Fortsätt till Podcast-generering
              </Button>
            </div>
          )}
        </>
      )}
      {step === 'audio' && script && projectId && (
        <PodcastGeneration
          projectId={projectId}
          scriptText={script}
          marketType="ir"
          onPodcastGenerated={handlePodcastGenerated}
        />
      )}
      {step === 'download' && (
        <DownloadStep 
          audioUrl={audioUrl} 
          onDownload={handleDownload} 
          onReset={handleReset} 
        />
      )}
    </div>
  );
};

export default WorkflowController;
