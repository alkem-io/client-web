import { useEffect, useState } from 'react';
import { Editor } from '@tiptap/core';

/**
 * Determines if the current selection is inside a table
 */
export const useTableState = (editor: Editor | null) => {
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    if (!editor) return;
    const onSelectionUpdate = ({ editor }: { editor: Editor }) => {
      setIsActive(editor.isActive('table'));
    };
    editor.on('selectionUpdate', onSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', onSelectionUpdate);
    };
  }, [editor]);
  return isActive;
};
