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
        htmlToMarkdown(ed.getHTML()).then(md => {
          onChangeRef.current(md);
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

  // Sync external value changes when editor is not focused
  useEffect(() => {
    if (!editor || !initialized || isFocusedRef.current) return;

    let cancelled = false;
    markdownToHtml(value).then(newHtml => {
      if (cancelled || isFocusedRef.current || !editor) return;
      // Only update if the content actually changed
      const currentHtml = editor.getHTML();
      if (newHtml !== currentHtml) {
        editor.commands.setContent(newHtml, { emitUpdate: false });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [value, editor, initialized]);

  return { editor };
}
