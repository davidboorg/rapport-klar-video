
import { Card, CardContent } from "@/components/ui/card";

const ScriptEditorLoading = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Laddar projektdata...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScriptEditorLoading;
