import type { EditorOptions } from '@tiptap/react';
import { useEditor } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import { htmlToMarkdown, markdownToHtml } from './markdownConverter';

type UseMarkdownEditorStateOptions = {
  value: string;
  onChange: (value: string) => void;
  editorOptions: Partial<EditorOptions>;
};

export function useMarkdownEditorState({ value, onChange, editorOptions }: UseMarkdownEditorStateOptions) {
  const [htmlContent, setHtmlContent] = useState('');
  const [initialized, setInitialized] = useState(false);
  const isFocusedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = useRef(value);
  valueRef.current = value;
  const updateVersionRef = useRef(0);
  // The markdown this editor last emitted through onChange. A parent that feeds
  // it back as `value` is echoing the editor's own state, not changing it.
  const lastEmittedRef = useRef<string | null>(null);

  // Convert inbound markdown to HTML on mount
  useEffect(() => {
    let cancelled = false;
    markdownToHtml(value).then(html => {
      if (!cancelled) {
        setHtmlContent(html);
        setInitialized(true);
      }
    });
    return () => {
      cancelled = true;
    };
    // Only run on mount
  }, []);

  const editor = useEditor(
    {
      ...editorOptions,
      content: htmlContent,
      onUpdate: ({ editor: ed }) => {
        const version = ++updateVersionRef.current;
        htmlToMarkdown(ed.getHTML()).then(md => {
          if (version === updateVersionRef.current) {
            lastEmittedRef.current = md;
            onChangeRef.current(md);
          }
        });
      },
      onFocus: () => {
        isFocusedRef.current = true;
      },
      onBlur: () => {
        isFocusedRef.current = false;
      },
    },
    [initialized]
  );

  // Sync external value changes when editor is not focused. The echo of the
  // editor's own output is skipped: the markdown -> HTML round trip is not
  // byte-identical, so re-applying it would replace the document and move the
  // cursor to the end. A toolbar click blurs the editor until the command
  // re-focuses it, which is exactly when that echo arrives.
  useEffect(() => {
    if (!editor || !initialized || isFocusedRef.current || value === lastEmittedRef.current) return;

    let cancelled = false;
    markdownToHtml(value).then(newHtml => {
      if (cancelled || isFocusedRef.current || !editor) return;
      // Only update if the content actually changed
      const currentHtml = editor.getHTML();
      if (newHtml !== currentHtml) {
        // The editor now holds an outside value, so its last emission no
        // longer describes it and a later reset to that markdown must apply.
        // An edit still being converted describes the replaced document, so
        // drop it too: emitting it would put stale markdown back in the parent.
        lastEmittedRef.current = null;
        updateVersionRef.current++;
        editor.commands.setContent(newHtml, { emitUpdate: false });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [value, editor, initialized]);

  return { editor };
}
