
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface UploadTabProps {
  marketType: 'ir' | 'board';
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadTab = ({ marketType, onFileUpload }: UploadTabProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <Upload className="w-16 h-16 mx-auto text-gray-400" />
          <div>
            <h3 className="text-lg font-medium mb-2">Upload Your Document</h3>
            <p className="text-gray-600 mb-4">
              Upload your {marketType === 'ir' ? 'quarterly report' : 'board briefing document'} for AI analysis
            </p>
            <input
              type="file"
              accept=".pdf"
              onChange={onFileUpload}
              className="hidden"
              id="document-upload"
            />
            <label htmlFor="document-upload">
              <Button asChild className="cursor-pointer">
                <span>Choose PDF File</span>
              </Button>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadTab;
