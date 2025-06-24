
import React, { useState } from 'react';
import UploadStep from './UploadStep';
import ProcessingStep from './ProcessingStep';
import ScriptReviewStep from './ScriptReviewStep';
import AudioGenerationStep from './AudioGenerationStep';
import VideoGenerationStep from './VideoGenerationStep';
import DownloadStep from './DownloadStep';
import StatusIndicator from './StatusIndicator';
import { mockProcessFile, mockGenerateAudio, mockGenerateVideo } from '@/lib/mockApi';

export type WorkflowStep = 'upload' | 'processing' | 'scriptReview' | 'audio' | 'video' | 'download';

const WorkflowController: React.FC = () => {
  const [step, setStep] = useState<WorkflowStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [script, setScript] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Väntar på uppladdning');

  const handleUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setStatus('Bearbetar rapport...');
    setStep('processing');
    
    const generatedScript = await mockProcessFile(uploadedFile);
    setScript(generatedScript);
    setStatus('Manus genererat');
    setStep('scriptReview');
  };

  const handleScriptApprove = async (approvedScript: string) => {
    setScript(approvedScript);
    setStatus('Genererar podcast...');
    setStep('audio');
    
    const audio = await mockGenerateAudio(approvedScript);
    setAudioUrl(audio);
    setStatus('Podcast klar');
  };

  const handleAudioReady = async () => {
    setStep('video');
    setStatus('Genererar video...');
    
    const video = await mockGenerateVideo(script || '');
    setVideoUrl(video);
    setStatus('Video klar');
    setStep('download');
  };

  const handleDownload = () => {
    setStatus('Klar för nedladdning');
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setScript(null);
    setAudioUrl(null);
    setVideoUrl(null);
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
        <DownloadStep audioUrl={audioUrl} videoUrl={videoUrl} onDownload={handleDownload} onReset={handleReset} />
      )}
    </div>
  );
};

export default WorkflowController;
