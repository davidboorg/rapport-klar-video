
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAdvancedProcessing } from "@/hooks/useAdvancedProcessing";

export const useScriptEditorUpload = (projectId: string) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showProcessing, setShowProcessing] = useState(false);
  const { toast } = useToast();

  const {
    tasks,
    currentTaskIndex,
    isProcessing,
    overallProgress,
    processDocument
  } = useAdvancedProcessing(projectId);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, marketType: 'ir' | 'board') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 50MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setShowProcessing(true);

    // Map marketType to the correct API parameter
    const documentType: 'quarterly' | 'board' = marketType === 'ir' ? 'quarterly' : 'board';

    toast({
      title: "Starting Upload",
      description: `Uploading ${file.name} for advanced processing...`,
    });

    // Start the advanced processing pipeline with Berget.ai
    const result = await processDocument(file, documentType);
    
    return result;
  };

  return {
    selectedFile,
    showProcessing,
    setShowProcessing,
    handleFileUpload,
    tasks,
    currentTaskIndex,
    isProcessing,
    overallProgress
  };
};
