
import ScriptEditorContent from "./ScriptEditorContent";

interface ScriptEditorProps {
  projectId: string;
  initialScript?: string;
  onScriptUpdate?: (script: string) => void;
}

const ScriptEditor = ({ projectId, initialScript = "", onScriptUpdate }: ScriptEditorProps) => {
  return (
    <ScriptEditorContent
      projectId={projectId}
      initialScript={initialScript}
      onScriptUpdate={onScriptUpdate}
    />
  );
};

export default ScriptEditor;
