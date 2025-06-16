
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bug, 
  RefreshCw, 
  Database, 
  FileText, 
  Brain,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ProcessingWorkflowDebuggerProps {
  projectId: string;
}

interface DebugInfo {
  project: any;
  generatedContent: any;
  pdfExtraction: any;
  aiAnalysis: any;
  errors: string[];
}

const ProcessingWorkflowDebugger: React.FC<ProcessingWorkflowDebuggerProps> = ({ projectId }) => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const errors: string[] = [];
    
    try {
      console.log('Running diagnostics for project:', projectId);
      
      // Check project data
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) {
        errors.push(`Project fetch error: ${projectError.message}`);
      }

      // Check generated content
      const { data: generatedContent, error: contentError } = await supabase
        .from('generated_content')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (contentError) {
        errors.push(`Generated content fetch error: ${contentError.message}`);
      }

      // Test PDF extraction if PDF URL exists
      let pdfExtraction = null;
      if (project?.pdf_url) {
        try {
          const { data: extractionData, error: extractionError } = await supabase.functions.invoke('extract-pdf-content', {
            body: {
              pdfUrl: project.pdf_url,
              projectId: projectId
            }
          });

          if (extractionError) {
            errors.push(`PDF extraction error: ${extractionError.message}`);
          } else {
            pdfExtraction = extractionData;
          }
        } catch (error) {
          errors.push(`PDF extraction failed: ${error}`);
        }
      }

      // Test AI analysis if we have content
      let aiAnalysis = null;
      if (pdfExtraction?.content) {
        try {
          const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-financial-data', {
            body: {
              projectId: projectId,
              pdfText: pdfExtraction.content
            }
          });

          if (analysisError) {
            errors.push(`AI analysis error: ${analysisError.message}`);
          } else {
            aiAnalysis = analysisData;
          }
        } catch (error) {
          errors.push(`AI analysis failed: ${error}`);
        }
      }

      setDebugInfo({
        project,
        generatedContent,
        pdfExtraction,
        aiAnalysis,
        errors
      });

    } catch (error) {
      console.error('Diagnostics error:', error);
      errors.push(`Diagnostics failed: ${error}`);
      setDebugInfo({
        project: null,
        generatedContent: null,
        pdfExtraction: null,
        aiAnalysis: null,
        errors
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runFullProcessingTest = async () => {
    setIsRunningTest(true);
    
    try {
      // First run diagnostics to get fresh data
      await runDiagnostics();
      
      // If we have a PDF URL, try to run the full processing pipeline
      if (debugInfo?.project?.pdf_url) {
        console.log('Running full processing test...');
        
        // Reset project status
        await supabase
          .from('projects')
          .update({ status: 'processing' })
          .eq('id', projectId);

        // Run PDF extraction
        const { data: extractionData, error: extractionError } = await supabase.functions.invoke('extract-pdf-content', {
          body: {
            pdfUrl: debugInfo.project.pdf_url,
            projectId: projectId
          }
        });

        if (extractionError) {
          throw new Error(`PDF extraction failed: ${extractionError.message}`);
        }

        // Run AI analysis
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-financial-data', {
          body: {
            projectId: projectId,
            pdfText: extractionData.content
          }
        });

        if (analysisError) {
          throw new Error(`AI analysis failed: ${analysisError.message}`);
        }

        console.log('Full processing test completed successfully');
        
        // Refresh diagnostics
        await runDiagnostics();
      }
    } catch (error) {
      console.error('Full processing test failed:', error);
    } finally {
      setIsRunningTest(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, [projectId]);

  const getStatusIcon = (hasData: boolean, hasError: boolean) => {
    if (hasError) return <AlertCircle className="w-4 h-4 text-red-600" />;
    if (hasData) return <CheckCircle className="w-4 h-4 text-green-600" />;
    return <Loader2 className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Processing Workflow Debugger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={runDiagnostics}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Run Diagnostics
            </Button>
            
            <Button
              onClick={runFullProcessingTest}
              disabled={isRunningTest || !debugInfo?.project?.pdf_url}
              size="sm"
            >
              {isRunningTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              Test Full Processing
            </Button>
          </div>

          {debugInfo && (
            <div className="space-y-4">
              {/* Project Status */}
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(!!debugInfo.project, debugInfo.errors.some(e => e.includes('Project')))}
                  <h4 className="font-medium">Project Data</h4>
                  <Badge variant={debugInfo.project?.status === 'completed' ? 'default' : 'outline'}>
                    {debugInfo.project?.status || 'unknown'}
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <div>PDF URL: {debugInfo.project?.pdf_url ? '✓ Present' : '✗ Missing'}</div>
                  <div>Financial Data: {debugInfo.project?.financial_data ? '✓ Present' : '✗ Missing'}</div>
                  <div>Status: {debugInfo.project?.status}</div>
                </div>
              </div>

              {/* Generated Content */}
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(!!debugInfo.generatedContent, debugInfo.errors.some(e => e.includes('content')))}
                  <h4 className="font-medium">Generated Content</h4>
                </div>
                <div className="text-sm space-y-1">
                  <div>Script Text: {debugInfo.generatedContent?.script_text ? '✓ Present' : '✗ Missing'}</div>
                  <div>Script Alternatives: {debugInfo.generatedContent?.script_alternatives ? `✓ ${Array.isArray(debugInfo.generatedContent.script_alternatives) ? debugInfo.generatedContent.script_alternatives.length : 'Invalid'} items` : '✗ Missing'}</div>
                  <div>Video URL: {debugInfo.generatedContent?.video_url ? '✓ Present' : '✗ Missing'}</div>
                </div>
              </div>

              {/* PDF Extraction */}
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(!!debugInfo.pdfExtraction?.success, debugInfo.errors.some(e => e.includes('PDF')))}
                  <h4 className="font-medium">PDF Extraction</h4>
                </div>
                <div className="text-sm space-y-1">
                  {debugInfo.pdfExtraction ? (
                    <>
                      <div>Status: {debugInfo.pdfExtraction.success ? '✓ Success' : '✗ Failed'}</div>
                      <div>Content Length: {debugInfo.pdfExtraction.content?.length || 0} characters</div>
                      <div>Method: {debugInfo.pdfExtraction.metadata?.method || 'unknown'}</div>
                    </>
                  ) : (
                    <div>Not tested (no PDF URL or previous error)</div>
                  )}
                </div>
              </div>

              {/* AI Analysis */}
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(!!debugInfo.aiAnalysis?.success, debugInfo.errors.some(e => e.includes('AI')))}
                  <h4 className="font-medium">AI Analysis</h4>
                </div>
                <div className="text-sm space-y-1">
                  {debugInfo.aiAnalysis ? (
                    <>
                      <div>Status: {debugInfo.aiAnalysis.success ? '✓ Success' : '✗ Failed'}</div>
                      <div>Financial Data: {debugInfo.aiAnalysis.financial_data ? '✓ Generated' : '✗ Missing'}</div>
                      <div>Message: {debugInfo.aiAnalysis.message || 'No message'}</div>
                    </>
                  ) : (
                    <div>Not tested (no PDF content or previous error)</div>
                  )}
                </div>
              </div>

              {/* Errors */}
              {debugInfo.errors.length > 0 && (
                <div className="p-3 border rounded-lg bg-red-50">
                  <h4 className="font-medium text-red-800 mb-2">Errors Found</h4>
                  <div className="space-y-1">
                    {debugInfo.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessingWorkflowDebugger;
