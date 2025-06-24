
import React, { useState } from 'react';
import UploadStep from './UploadStep';
import ProcessingStep from './ProcessingStep';
import ScriptReviewStep from './ScriptReviewStep';
import AudioGenerationStep from './AudioGenerationStep';
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

      // Get the generated script alternatives
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

  const handleScriptApprove = async (approvedScript: string) => {
    try {
      setScript(approvedScript);
      setStatus('Genererar podcast med ElevenLabs...');
      setStep('audio');

      // Call our generate-podcast Supabase function with valid ElevenLabs voice
      const { data: audioData, error: audioError } = await supabase.functions.invoke('generate-podcast', {
        body: {
          text: approvedScript,
          voice: '9BWtsMINqrJLrRacOk9x', // Use Aria voice (valid ElevenLabs voice ID)
          projectId: projectId
        }
      });

      if (audioError) {
        throw new Error(`Podcast-generering misslyckades: ${audioError.message}`);
      }

      if (!audioData?.success) {
        throw new Error(`Podcast-fel: ${audioData?.error || 'Okänt fel'}`);
      }

      // Convert base64 to blob URL for playback
      const audioBlob = new Blob([Uint8Array.from(atob(audioData.audioContent), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      setAudioUrl(audioUrl);
      setStatus('Podcast klar för nedladdning');

      toast({
        title: "Podcast Genererad!",
        description: "Din podcast är redo att lyssna på och ladda ner.",
      });

      // Skip directly to download since we're not doing video yet
      setTimeout(() => {
        setStep('download');
        setStatus('Klar för nedladdning');
      }, 1000);

    } catch (error) {
      console.error('Audio generation error:', error);
      setStatus(`Fel: ${error instanceof Error ? error.message : 'Okänt fel'}`);
      
      toast({
        title: "Podcast-fel",
        description: error instanceof Error ? error.message : 'Kunde inte generera podcast',
        variant: "destructive",
      });
    }
  };

  const handleAudioReady = () => {
    setStep('video');
    setStatus('Video-steg (kommer snart)...');
    
    // Skip video for now and go directly to download
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
      {step === 'audio' && script && (
        <AudioGenerationStep script={script} audioUrl={audioUrl} onAudioReady={handleAudioReady} />
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
