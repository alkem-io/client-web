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
import type { EditorView } from '@tiptap/pm/view';
import StarterKit from '@tiptap/starter-kit';
import type { CollabProviderLike, YDocLike } from './collabProviderTypes';
import { Iframe } from './extensions/iframe/Iframe';

type SharedConfig = {
  disabled?: boolean;
  ariaLabel?: string;
  /**
   * Optional uploader for pasted/dropped image files. When provided, image files
   * in clipboard or drag-drop payloads are uploaded via this callback and the
   * resulting URL is inserted as `<img src>` — bypassing the data-URL path that
   * the markdown sanitizer would later strip on round-trip.
   */
  onImageUpload?: (file: File) => Promise<string>;
  /** Called with a user-facing error message when an image upload fails. */
  onError?: (message: string) => void;
};

type NonCollabConfig = SharedConfig & {
  collaborative: false;
};

type CollabConfig = SharedConfig & {
  collaborative: true;
  ydoc: YDocLike;
  provider: CollabProviderLike;
  user: { name: string; color: string };
};

type BuildConfig = NonCollabConfig | CollabConfig;

const isImageFile = (item: DataTransferItem) => item.kind === 'file' && item.type.startsWith('image/');

function createImagePasteHandler(onImageUpload: (file: File) => Promise<string>, onError?: (message: string) => void) {
  const insert = (view: EditorView, files: File[]) => {
    for (const file of files) {
      onImageUpload(file)
        .then(url => {
          const { schema } = view.state;
          const node = schema.nodes.image?.create({ src: url, alt: file.name });
          if (!node) return;
          const tr = view.state.tr.replaceSelectionWith(node);
          view.dispatch(tr);
        })
        .catch(err => {
          onError?.(err instanceof Error ? err.message : 'Image upload failed');
        });
    }
  };

  const handlePaste = (view: EditorView, event: ClipboardEvent): boolean => {
    const items = event.clipboardData?.items;
    if (!items) return false;
    const files: File[] = [];
    for (const item of Array.from(items)) {
      if (isImageFile(item)) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length === 0) return false;
    event.preventDefault();
    insert(view, files);
    return true;
  };

  const handleDrop = (view: EditorView, event: DragEvent): boolean => {
    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return false;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return false;
    event.preventDefault();
    insert(view, imageFiles);
    return true;
  };

  return { handlePaste, handleDrop };
}

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
  const { collaborative, disabled = false, ariaLabel = 'Markdown editor', onImageUpload, onError } = config;

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

  const pasteHandlers = onImageUpload ? createImagePasteHandler(onImageUpload, onError) : undefined;

  return {
    extensions,
    editable: !disabled,
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': ariaLabel,
      },
      ...(pasteHandlers ?? {}),
    },
  };
}
