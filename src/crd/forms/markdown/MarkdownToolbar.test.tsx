/**
 * Verifies the toolbar swaps between the table insert-picker and the table
 * ops menu reactively as the cursor enters/leaves a table. Regression guard
 * for the bug where the toolbar was wired with a plain useEffect+setTick
 * pattern that didn't re-evaluate `editor.isActive('table')`.
 */

import { act, render, screen } from '@testing-library/react';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { type Editor, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import i18n from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, it } from 'vitest';
import { MarkdownToolbar } from './MarkdownToolbar';

const tableHtml = '<p>before</p><table><tbody><tr><td><p>cell</p></td><td><p>x</p></td></tr></tbody></table>';

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: {
        'crd-markdown': {
          editor: {
            toolbar: 'Toolbar',
            undo: 'Undo',
            redo: 'Redo',
            bold: 'Bold',
            italic: 'Italic',
            heading1: 'H1',
            heading2: 'H2',
            heading3: 'H3',
            bulletList: 'UL',
            orderedList: 'OL',
            blockquote: 'Quote',
            codeBlock: 'Code',
            horizontalRule: 'HR',
            insertTable: 'Insert table',
            link: 'Link',
            emoji: 'Emoji',
            cancel: 'Cancel',
            ok: 'OK',
            insert: 'Insert',
            'image.insert': 'Insert image',
            'image.dialogTitle': 'Insert image',
            'image.url': 'URL',
            'image.alt': 'Description',
            'embed.insert': 'Insert embed',
            'embed.dialogTitle': 'Embed',
            'embed.placeholder': 'Paste',
            'embed.codeLabel': 'Embed',
            'link.url': 'URL',
            'link.apply': 'Apply',
            'link.remove': 'Remove',
            'link.placeholder': 'https://',
            'link.invalid': 'invalid',
            'table.operations': 'Table operations',
            'table.gridSize': '{{cols}} × {{rows}}',
            'table.cellAria': 'Insert',
            'table.custom': 'Custom',
            'table.columns': 'Columns',
            'table.rows': 'Rows',
            'table.addColumnBefore': 'Add column before',
            'table.addColumnAfter': 'Add column after',
            'table.addRowBefore': 'Add row before',
            'table.addRowAfter': 'Add row after',
            'table.deleteConfirm': 'Confirm',
            'table.deleteConfirmAction': 'Delete table',
            deleteTable: 'Delete table',
            deleteColumn: 'Delete column',
            deleteRow: 'Delete row',
          },
        },
      },
    },
  });
});

// Module-level capture cell — the test reads from this, the Wrapper's
// `onCreate` callback writes to it. react-compiler forbids mutating props
// inside a component, so we route through a module-scoped variable instead.
let capturedEditor: Editor | null = null;
const captureEditor = (e: Editor) => {
  capturedEditor = e;
};

function Wrapper() {
  const editor = useEditor({
    extensions: [StarterKit, Table, TableRow, TableHeader, TableCell],
    content: tableHtml,
    // onCreate fires after the editor is built, outside React render — safe to
    // hand the instance to the test harness without violating react-compiler's
    // "no side effects during render" rule.
    onCreate({ editor: created }) {
      captureEditor(created);
    },
  });
  return (
    <I18nextProvider i18n={i18n}>
      <MarkdownToolbar editor={editor} />
    </I18nextProvider>
  );
}

describe('MarkdownToolbar table reactivity', () => {
  it('shows insert picker when caret is outside a table, ops menu when inside', async () => {
    capturedEditor = null;
    render(<Wrapper />);

    // Flush React 19 effects so `useEditor`'s post-mount creation runs and
    // `onCreate` populates `capturedEditor`.
    await act(async () => {});

    // Initial caret at start → not in table
    await act(async () => {
      capturedEditor?.commands.setTextSelection(1);
    });
    expect(screen.getByLabelText('Insert table')).toBeTruthy();
    expect(screen.queryByLabelText('Table operations')).toBeNull();

    // Move caret into the first table cell → switches to ops menu
    await act(async () => {
      const ed = capturedEditor;
      if (!ed) throw new Error('editor not initialised');
      let pos = -1;
      ed.state.doc.descendants((node, p) => {
        if (pos === -1 && node.type.name === 'tableCell') {
          pos = p + 2;
          return false;
        }
        return true;
      });
      ed.commands.setTextSelection(pos);
    });
    expect(screen.queryByLabelText('Insert table')).toBeNull();
    expect(screen.getByLabelText('Table operations')).toBeTruthy();
  });
});
