import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import type { EditorOptions, Extensions } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

type UseEditorExtensionsOptions = {
  disabled?: boolean;
  additionalExtensions?: Extensions;
  ariaLabel?: string;
};

export function useEditorExtensions(options?: UseEditorExtensionsOptions): Partial<EditorOptions> {
  const { disabled = false, additionalExtensions = [], ariaLabel = 'Markdown editor' } = options ?? {};

  const hasCollaboration = additionalExtensions.some(ext => ext && 'name' in ext && ext.name === 'collaboration');

  const extensions: Extensions = [
    StarterKit.configure({
      link: false, // replaced by standalone Link extension
      ...(hasCollaboration ? { history: false } : {}),
    }),
    Link.configure({
      openOnClick: false,
    }),
    Highlight,
    Table,
    TableRow,
    TableHeader,
    TableCell,
    ...additionalExtensions,
  ];

  return {
    extensions,
    editable: !disabled,
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': ariaLabel,
      },
    },
  };
}
