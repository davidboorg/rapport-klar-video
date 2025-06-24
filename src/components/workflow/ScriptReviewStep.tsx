
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Check } from 'lucide-react';

interface ScriptReviewStepProps {
  script: string;
  onApprove: (script: string) => void;
}

const ScriptReviewStep: React.FC<ScriptReviewStepProps> = ({ script, onApprove }) => {
  const [editedScript, setEditedScript] = useState(script);

  const handleApprove = () => {
    onApprove(editedScript);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Granska och redigera manus
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">
            Här är det genererade manuset. Du kan redigera det innan vi fortsätter.
          </p>
          <Textarea
            value={editedScript}
            onChange={(e) => setEditedScript(e.target.value)}
            rows={10}
            className="w-full"
            placeholder="Redigera manuset här..."
          />
          <div className="flex justify-end">
            <Button onClick={handleApprove} className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Godkänn manus
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScriptReviewStep;
