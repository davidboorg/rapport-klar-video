
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ExtractionResult {
  success: boolean;
  content?: string;
  error?: string;
  metadata?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    wordCount: number;
    processingTime: number;
  };
}

export const useDocumentExtraction = (options?: { silent?: boolean }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();
  const silent = options?.silent ?? false;

  const extractDocumentContent = async (file: File, projectId: string): Promise<ExtractionResult> => {
    setIsExtracting(true);
    
    try {
      // Upload file to Supabase storage
      const fileName = `${projectId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Create a signed URL (valid for 1 hour)
      const { data: signedData, error: signedError } = await supabase.storage
        .from('documents')
        .createSignedUrl(fileName, 60 * 60);

      if (signedError || !signedData?.signedUrl) {
        throw new Error(`Failed to create signed URL: ${signedError?.message || 'Unknown error'}`);
      }
      console.log('Document uploaded, extracting content...');

      // Call extraction edge function with fileName
      const { data: extractionData, error: extractionError } = await supabase.functions.invoke('extract-pdf-content', {
        body: {
          pdfUrl: signedData.signedUrl,
          projectId: projectId,
          fileName: file.name,
          fileType: file.type
        }
      });

      if (extractionError) {
        console.error('Extraction error:', extractionError);
        throw new Error(`Content extraction failed: ${extractionError.message}`);
      }

      if (!extractionData?.success) {
        throw new Error(extractionData?.error || 'Failed to extract document content');
      }

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const documentType = fileExtension === 'pdf' ? 'PDF' : fileExtension === 'docx' ? 'Word-dokument' : 'dokument';

      if (!silent) {
        toast({
          title: "Dokument bearbetat framgångsrikt",
          description: `Extraherade ${extractionData.metadata?.wordCount || 'text'} ord från ${documentType}`,
        });
      }

      return {
        success: true,
        content: extractionData.content,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          wordCount: extractionData.metadata?.wordCount || 0,
          processingTime: extractionData.metadata?.processingTimeMs || 0
        }
      };

    } catch (error) {
      console.error('Document extraction error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Extraktion misslyckades",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsExtracting(false);
    }
  };

  return {
    extractDocumentContent,
    isExtracting
  };
};
