import './styles.scss';

import { useMemo } from 'react';
import { EditorOptions, Extensions } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Highlight } from '@tiptap/extension-highlight';
import { Iframe } from '../../MarkdownInputControls/InsertEmbedCodeButton/Iframe';
import { EditorView } from '@tiptap/pm/view';

const ImageExtension = Image.configure({ inline: true });

interface UseEditorConfigProps {
  handlePaste: (view: EditorView, event: ClipboardEvent) => boolean;
  disabled?: boolean;
  additionalExtensions?: Extensions;
}

export const useEditorConfig = ({
  handlePaste,
  disabled = false,
  additionalExtensions = [],
}: UseEditorConfigProps): Partial<EditorOptions> => {
  return useMemo(() => {
    const hasCollaboration = additionalExtensions.some(ext => ext.name === 'collaboration');

    // If collaboration is enabled, we don't want to include the undo/redo functionality
    // as it can conflict with the collaboration extension's own history management.
    // Therefore, we configure StarterKit to exclude history when collaboration is present.
    const StarterKitConfigured = StarterKit.configure({
      // Exclude link since we're adding our own Link extension
      link: false,
      undoRedo: hasCollaboration ? false : undefined,
    });

    const extensions: Extensions = [
      StarterKitConfigured,
      ImageExtension,
      Link,
      Highlight,
      Iframe,
      ...additionalExtensions,
    ];

    return {
      extensions,
      editorProps: {
        handlePaste,
        attributes: {
          'aria-label': 'Markdown editor',
          'aria-multiline': 'true',
          'aria-disabled': disabled ? 'true' : 'false',
          role: 'textbox',
        },
      },
      editable: !disabled,
    };
  }, [handlePaste, disabled, additionalExtensions]);
};
