import type { Editor } from '@tiptap/react';

export function isEditorReady(editor: Editor | null): editor is Editor {
  if (!editor) return false;
  try {
    return !!editor.view?.dom;
  } catch {
    return false;
  }
}
