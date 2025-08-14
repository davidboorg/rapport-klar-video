import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDocumentToPodcast } from "@/hooks/useDocumentToPodcast";

const MVPDemo: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const { processDocument, isProcessing, progress, audioUrl, downloadAudio } =
    useDocumentToPodcast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleProcess = () => {
    if (file) {
      processDocument(file);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-center">
        Document to Podcast Demo
      </h1>
      <input type="file" onChange={handleFileChange} className="w-full" />
      <Button
        onClick={handleProcess}
        disabled={!file || isProcessing}
        className="w-full"
      >
        {isProcessing ? "Processing..." : "Generate Podcast"}
      </Button>
      {isProcessing && <Progress value={progress} className="w-full" />}
      {audioUrl && (
        <div className="space-y-2">
          <audio controls src={audioUrl} className="w-full" />
          <Button onClick={() => downloadAudio()} className="w-full">
            Download MP3
          </Button>
        </div>
      )}
    </div>
  );
};

export default MVPDemo;
