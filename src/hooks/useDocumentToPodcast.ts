import { useState } from "react";
import { useDocumentExtraction } from "@/hooks/useDocumentExtraction";
import { RealApiIntegration } from "@/lib/realApiIntegration";
import { useToast } from "@/hooks/use-toast";

export type ProcessingStep =
  | "idle"
  | "extracting"
  | "generatingScript"
  | "generatingAudio"
  | "completed";

export const useDocumentToPodcast = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<ProcessingStep>("idle");
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [script, setScript] = useState<string>("");
  const { extractDocumentContent } = useDocumentExtraction({ silent: true });
  const { toast } = useToast();

  const processDocument = async (file: File) => {
    setIsProcessing(true);
    setStep("extracting");
    setProgress(10);
    const projectId = `mvp_${Date.now()}`;

    try {
      const extraction = await extractDocumentContent(file, projectId);
      if (!extraction.success || !extraction.content) {
        throw new Error(extraction.error || "Document extraction failed");
      }
      setProgress(40);

      setStep("generatingScript");
      const scriptResult = await RealApiIntegration.generateScript({
        projectId,
        extractedText: extraction.content,
        documentType: "quarterly",
        targetAudience: "investors",
      });
      if (!scriptResult.success || !scriptResult.script) {
        throw new Error("Script generation failed");
      }
      setScript(scriptResult.script);
      setProgress(70);

      setStep("generatingAudio");
      const audioResult = await RealApiIntegration.generatePodcast({
        projectId,
        scriptText: scriptResult.script,
      });
      if (!audioResult.success || !audioResult.audioUrl) {
        throw new Error("Audio generation failed");
      }
      setAudioUrl(audioResult.audioUrl);
      setProgress(100);
      setStep("completed");
      toast({
        title: "Podcast Ready",
        description: "Audio has been generated successfully.",
      });
      return audioResult.audioUrl;
    } catch (error) {
      console.error("Document to podcast processing failed:", error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
      setStep("idle");
      setProgress(0);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAudio = (fileName: string = "podcast.mp3") => {
    if (!audioUrl) return;
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    processDocument,
    isProcessing,
    step,
    progress,
    audioUrl,
    script,
    downloadAudio,
  };
};

export default useDocumentToPodcast;
