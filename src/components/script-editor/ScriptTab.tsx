
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ScriptTabProps {
  script: string;
  setScript: (script: string) => void;
  marketType: 'ir' | 'board';
  isSaving: boolean;
  onSave: () => void;
}

const ScriptTab = ({ script, setScript, marketType, isSaving, onSave }: ScriptTabProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {marketType === 'ir' ? 'Investor Communication Script' : 'Board Briefing Script'}
            </label>
            <Textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder={
                marketType === 'ir' 
                  ? "Enter your investor presentation script here..."
                  : "Enter your board briefing script here..."
              }
              className="min-h-[300px]"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Script'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScriptTab;
