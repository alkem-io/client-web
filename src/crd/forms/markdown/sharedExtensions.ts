import type { EditorOptions, Extensions } from '@tiptap/core';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import StarterKit from '@tiptap/starter-kit';
import type { CollabProviderLike, YDocLike } from './collabProviderTypes';
import { Iframe } from './extensions/iframe/Iframe';

type NonCollabConfig = {
  collaborative: false;
  disabled?: boolean;
  ariaLabel?: string;
};

type CollabConfig = {
  collaborative: true;
  ydoc: YDocLike;
  provider: CollabProviderLike;
  user: { name: string; color: string };
  disabled?: boolean;
  ariaLabel?: string;
};

type BuildConfig = NonCollabConfig | CollabConfig;

/**
 * Mirrors the Tiptap extension list used by the MUI `useEditorConfig` hook
 * (src/core/ui/forms/MarkdownInput/hooks/useEditorConfig.ts) so both editors
 * round-trip identical HTML.
 *
 * Collaborative mode disables StarterKit's undo/redo (Yjs owns history) and
 * appends Collaboration + CollaborationCaret. The `ydoc` and `provider` are
 * opaque from CRD's perspective (see collabProviderTypes.ts) — the `as never`
 * casts bridge CRD's opaque shapes to Tiptap's concrete Yjs/Hocuspocus types
 * at the single point where both sides meet.
 */
export function buildCrdMarkdownExtensions(config: BuildConfig): Partial<EditorOptions> {
  const { collaborative, disabled = false, ariaLabel = 'Markdown editor' } = config;

  const extensions: Extensions = [
    StarterKit.configure({
      link: false,
      undoRedo: collaborative ? false : undefined,
    }),
    Image.configure({ inline: true }),
    Link.configure({ openOnClick: false }),
    Highlight,
    Iframe,
    Table,
    TableRow,
    TableHeader,
    TableCell,
  ];

  if (collaborative) {
    // Opaque → concrete boundary: CRD never imports `yjs` or `@hocuspocus/provider`.
    extensions.push(
      Collaboration.configure({ document: config.ydoc as never }),
      CollaborationCaret.configure({
        provider: config.provider as never,
        user: { name: config.user.name, color: config.user.color },
      })
    );
  }

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
