import React, { FormEvent, forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { InputBaseComponentProps } from '@mui/material/InputBase/InputBase';
import { useSetCharacterCount } from './CharacterCountContext';
import MarkdownInputControls from '../MarkdownInputControls/MarkdownInputControls';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import usePersistentValue from '../../../utils/usePersistentValue';
import UnifiedConverter from '../../markdown/html/UnifiedConverter';
import { gutters } from '../../grid/utils';

interface MarkdownInputProps extends InputBaseComponentProps {
  controlsVisible: 'always' | 'focused';
}

interface Offset {
  x: string;
  y: string;
}

export interface MarkdownInputRefApi {
  focus: () => void;
  value: string | undefined;
  getLabelOffset: () => Offset;
}

const ImageExtension = Image.configure({
  inline: true,
});

const proseMirrorStyles = {
  outline: 'none',
  minHeight: gutters(4),
  padding: gutters(0.5),
  '& p:first-child': { marginTop: 0 },
  '& p:last-child': { marginBottom: 0 },
  '& img': { maxWidth: '100%' },
} as const;

export const MarkdownInput = forwardRef<MarkdownInputRefApi, MarkdownInputProps>(
  ({ value, onChange, controlsVisible = 'focused', onFocus, onBlur }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const [hasFocus, setHasFocus] = useState(false);
    const [isControlsDialogOpen, setIsControlsDialogOpen] = useState(false);
    const isInteractingWithInput = hasFocus || isControlsDialogOpen;

    const [htmlContent, setHtmlContent] = useState('');

    const { markdownToHTML, HTMLToMarkdown } = usePersistentValue(UnifiedConverter());

    const updateHtmlContent = async () => {
      const content = await markdownToHTML(value);
      setHtmlContent(String(content));
    };

    const editor = useEditor(
      {
        extensions: [StarterKit, ImageExtension, Link],
        content: htmlContent,
      },
      [htmlContent]
    );

    useLayoutEffect(() => {
      if (!editor || !isInteractingWithInput || editor.getText() === '') {
        updateHtmlContent();
      }
    }, [value, hasFocus]);

    const theme = useTheme();

    const areControlsVisible = () => {
      if (controlsVisible === 'always') {
        return true;
      }
      if (controlsVisible === 'focused') {
        return isInteractingWithInput;
      }
    };

    const getLabelOffset = () => {
      const guttersY = areControlsVisible() ? 3 : 1;

      return {
        x: gutters()(theme),
        y: gutters(guttersY)(theme),
      };
    };

    useImperativeHandle(
      ref,
      () => ({
        getLabelOffset,
        focus: () => editor?.commands.focus(),
        get value() {
          return editor?.getText();
        },
      }),
      [editor, areControlsVisible()]
    );

    const setCharacterCount = useSetCharacterCount();

    useLayoutEffect(() => {
      setCharacterCount(editor?.getText().length ?? 0);
    }, [editor]);

    const emitChangeOnEditorUpdate = (editor: Editor) => {
      const handleStateChange = async () => {
        const markdown = await HTMLToMarkdown(editor.getHTML());

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
    };

    useEffect(() => {
      if (editor) {
        return emitChangeOnEditorUpdate(editor);
      }
    }, [editor]);

    const [prevEditorHeight, setPrevEditorHeight] = useState(0);

    const keepScrollPositionOnEditorReset = (editor: Editor) => {
      const handleCreate = () => {
        setPrevEditorHeight(0);
      };

      const handleDestroy = () => {
        setPrevEditorHeight(editor.view.dom.clientHeight);
      };

      editor.on('create', handleCreate);
      editor.on('destroy', handleDestroy);

      return () => {
        editor.off('create', handleCreate);
        editor.off('destroy', handleDestroy);
      };
    };

    useEffect(() => {
      if (editor) {
        return keepScrollPositionOnEditorReset(editor);
      }
    }, [editor]);

    const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
      setHasFocus(true);
      onFocus?.(event as React.FocusEvent<HTMLInputElement>);
    };

    const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
      if (containerRef.current?.contains(event.relatedTarget)) {
        return;
      }
      setHasFocus(false);
      onBlur?.(event as React.FocusEvent<HTMLInputElement>);
    };

    return (
      <Box ref={containerRef} width="100%" onFocus={handleFocus} onBlur={handleBlur}>
        <MarkdownInputControls
          editor={editor}
          visible={areControlsVisible()}
          onDialogOpen={() => setIsControlsDialogOpen(true)}
          onDialogClose={() => setIsControlsDialogOpen(false)}
        />
        <Box
          width="100%"
          maxHeight="50vh"
          sx={{
            overflowY: 'auto',
            '.ProseMirror': proseMirrorStyles,
          }}
        >
          <Box style={{ minHeight: prevEditorHeight }}>
            <EditorContent editor={editor} />
          </Box>
        </Box>
      </Box>
    );
  }
);

export default MarkdownInput;
