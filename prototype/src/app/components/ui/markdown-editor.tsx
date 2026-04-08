import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = "Write something...", 
  className,
  minHeight = "200px"
}: MarkdownEditorProps) {
  
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ],
  };

  return (
    <div className={cn("prose-editor flex flex-col", className)}>
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange} 
        modules={quillModules}
        placeholder={placeholder}
        className="flex-1 flex flex-col"
        style={{
            minHeight: minHeight,
            display: 'flex',
            flexDirection: 'column'
        }}
      />
      <style>{`
        .prose-editor .quill {
          display: flex;
          flex-direction: column;
          background-color: var(--background);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .prose-editor .ql-toolbar {
          border: none;
          border-bottom: 1px solid var(--border);
          background-color: var(--muted);
          padding: 8px;
        }
        .prose-editor .ql-container {
          border: none;
          flex: 1;
          display: flex;
          flex-direction: column;
          font-family: inherit;
          font-size: 0.9375rem; /* text-base */
        }
        .prose-editor .ql-editor {
          flex: 1;
          padding: 16px;
          min-height: ${minHeight};
        }
        .prose-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          opacity: 0.6;
          font-style: normal;
        }
      `}</style>
    </div>
  );
}