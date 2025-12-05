import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Editor, useEditor } from '@tiptap/react';
import { EditorState } from '@tiptap/pm/state';
import { Selection } from 'prosemirror-state';
import { FormEvent } from 'react';
import UnifiedConverter from '@/core/ui/markdown/html/UnifiedConverter';
import { useSetCharacterCount } from '../CharacterCountContext';
import { EditorOptions } from '@tiptap/core';

interface UseMarkdownEditorProps {
  value?: string;
  onChange?: (event: FormEvent<HTMLInputElement>) => void;
  maxLength?: number;
  editorConfig: Partial<EditorOptions>;
  isInteractingWithInput: boolean;
}

export const useMarkdownEditor = ({
  value,
  onChange,
  maxLength,
  editorConfig,
  isInteractingWithInput,
}: UseMarkdownEditorProps) => {
  const [htmlContent, setHtmlContent] = useState('');
  const converter = UnifiedConverter();
  const converterRef = useRef(converter);
  // Always keep the ref updated with the latest converter, but use the initial one for stability
  converterRef.current ??= converter;
  const { markdownToHTML, HTMLToMarkdown } = converterRef.current;
  const setCharacterCount = useSetCharacterCount();

  const updateHtmlContent = useCallback(async () => {
    const content = await markdownToHTML(value || '');
    setHtmlContent(String(content));
  }, [value, markdownToHTML]);

  const editor = useEditor({ ...editorConfig, content: htmlContent }, [htmlContent]);
  const shadowEditor = useEditor({ ...editorConfig, content: '', editable: false });

  useLayoutEffect(() => {
    if (!editor || !isInteractingWithInput || editor.getText() === '') {
      updateHtmlContent();
    }
  }, [value, isInteractingWithInput, editor, updateHtmlContent]);

  useLayoutEffect(() => {
    setCharacterCount(editor?.getText().length ?? 0);
  }, [editor, setCharacterCount]);

  const wrapIframeWithStyledDiv = useCallback(
    (markdown: string): string =>
      markdown.replace(
        /<iframe[^>]*><\/iframe>/g,
        iframe =>
          `<div style='position: relative; padding-bottom: 56.25%; width: 100%; overflow: hidden; border-radius: 8px; margin-bottom: 10px;'>${iframe}</div>`
      ),
    []
  );

  const emitChangeOnEditorUpdate = useCallback(
    (editor: Editor) => {
      const handleStateChange = async () => {
        let markdown = await HTMLToMarkdown(editor.getHTML());
        markdown = wrapIframeWithStyledDiv(markdown);
        setCharacterCount(editor.getText().length);

        onChange?.({
          currentTarget: {
            value: markdown,
          },
          target: {
            value: markdown,
          },
        } as unknown as FormEvent<HTMLInputElement>);
      };

      editor.on('update', handleStateChange);

      return () => {
        editor.off('update', handleStateChange);
      };
    },
    [HTMLToMarkdown, wrapIframeWithStyledDiv, setCharacterCount, onChange]
  );

  useEffect(() => {
    if (editor) {
      return emitChangeOnEditorUpdate(editor);
    }
  }, [editor, emitChangeOnEditorUpdate]);

  const updateShadowEditor = useCallback(
    (editor: Editor, maxLength: number) => {
      const highlightOverflow = () => {
        if (!shadowEditor) {
          return;
        }

        const contentLength = editor.getText().length;

        if (contentLength <= maxLength) {
          return;
        }

        try {
          shadowEditor.view.updateState(EditorState.create({ doc: editor.state.doc }));
        } catch (error) {
          console.error('Failed to update shadow editor state:', error);
        }

        const end = Selection.atEnd(shadowEditor.state.doc).from;
        const overflow = contentLength - maxLength;

        shadowEditor
          .chain()
          .setTextSelection({
            from: end - overflow,
            to: end,
          })
          .setHighlight()
          .run();
      };

      highlightOverflow();

      editor.on('update', highlightOverflow);

      return () => {
        editor.off('update', highlightOverflow);
      };
    },
    [shadowEditor]
  );

  useEffect(() => {
    if (editor && typeof maxLength === 'number') {
      return updateShadowEditor(editor, maxLength);
    }
  }, [editor, maxLength, updateShadowEditor]);

  return {
    editor,
    shadowEditor,
  };
};
