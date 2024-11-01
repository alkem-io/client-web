import React, {
  memo,
  useRef,
  useState,
  useEffect,
  FormEvent,
  forwardRef,
  useCallback,
  useLayoutEffect,
  useImperativeHandle,
} from 'react';

import StarterKit from '@tiptap/starter-kit';
import { EditorOptions } from '@tiptap/core';
import { Box, useTheme } from '@mui/material';
import { Link } from '@tiptap/extension-link';
import { Selection } from 'prosemirror-state';
import { EditorState } from '@tiptap/pm/state';
import { Image } from '@tiptap/extension-image';
import { Highlight } from '@tiptap/extension-highlight';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import { InputBaseComponentProps } from '@mui/material/InputBase/InputBase';

import UnifiedConverter from '../../markdown/html/UnifiedConverter';
import MarkdownInputControls from '../MarkdownInputControls/MarkdownInputControls';
import { CharacterCountContainer, useSetCharacterCount } from './CharacterCountContext';

import { gutters } from '../../grid/utils';
import usePersistentValue from '../../../utils/usePersistentValue';

const proseMirrorStyles = {
  outline: 'none',
  minHeight: gutters(4),
  padding: gutters(0.5),
  '& p:first-child': { marginTop: 0 },
  '& p:last-child': { marginBottom: 0 },
  '& img': { maxWidth: '100%' },
} as const;
const ImageExtension = Image.configure({ inline: true });
const editorOptions: Partial<EditorOptions> = {
  extensions: [StarterKit, ImageExtension, Link, Highlight],
};

export const MarkdownInput = memo(
  forwardRef<MarkdownInputRefApi, MarkdownInputProps>(
    (
      {
        value,
        maxLength,
        hideImageOptions,
        temporaryLocation = false,
        controlsVisible = 'focused',
        onBlur,
        onFocus,
        onChange,
      },
      ref
    ) => {
      const toolbarRef = useRef<HTMLDivElement>(null);
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

      const editor = useEditor({ ...editorOptions, content: htmlContent }, [htmlContent]);

      // Currently used to highlight overflow but can be reused for other similar features as well
      const shadowEditor = useEditor({ ...editorOptions, content: '', editable: false });

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

        return false;
      };

      const getLabelOffset = () => {
        const offsetY = areControlsVisible()
          ? toolbarRef.current
            ? `${toolbarRef.current.clientHeight + 20}px`
            : gutters(3)(theme)
          : gutters(1)(theme);

        return {
          x: gutters()(theme),
          y: offsetY,
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
            currentTarget: { value: markdown },
            target: { value: markdown },
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

      const updateShadowEditor = (editor: Editor, maxLength: number) => {
        const highlightOverflow = () => {
          if (!shadowEditor) {
            return;
          }

          const contentLength = editor.getText().length;

          if (contentLength <= maxLength) {
            return;
          }

          try {
            shadowEditor.view.updateState(EditorState.create({ doc: editor.state.doc }));
          } catch (error) {
            // In some states the "shadow" editor fails to update, but this doesn't break the highlight
          }

          const end = Selection.atEnd(shadowEditor.state.doc).from;
          const overflow = contentLength - maxLength;

          shadowEditor
            .chain()
            .setTextSelection({
              from: end - overflow,
              to: end,
            })
            .setHighlight() // Passing a highlight color doesn't work well here, styled later in sx={mark:{...}}
            .run();
        };

        highlightOverflow();

        editor.on('update', highlightOverflow);

        return () => {
          editor.off('update', highlightOverflow);
        };
      };

      useEffect(() => {
        if (editor && typeof maxLength === 'number') {
          return updateShadowEditor(editor, maxLength);
        }
      }, [editor, maxLength]);

      const [prevEditorHeight, setPrevEditorHeight] = useState(0);

      const keepScrollPositionOnEditorReset = (editor: Editor) => {
        const handleCreate = () => {
          setPrevEditorHeight(0);
        };

        editor.on('create', handleCreate);

        return () => {
          editor.off('create', handleCreate);
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

        setPrevEditorHeight(editor?.view.dom.clientHeight ?? 0);
        setHasFocus(false);
        onBlur?.(event as React.FocusEvent<HTMLInputElement>);
      };

      const handleDialogOpen = useCallback(() => setIsControlsDialogOpen(true), [setIsControlsDialogOpen]);
      const handleDialogClose = useCallback(() => setIsControlsDialogOpen(false), [setIsControlsDialogOpen]);

      return (
        <Box ref={containerRef} width="100%" onBlur={handleBlur} onFocus={handleFocus}>
          <MarkdownInputControls
            ref={toolbarRef}
            editor={editor}
            visible={areControlsVisible()}
            hideImageOptions={hideImageOptions}
            temporaryLocation={temporaryLocation}
            onDialogOpen={handleDialogOpen}
            onDialogClose={handleDialogClose}
          />

          <Box width="100%" maxHeight="50vh" sx={{ overflowY: 'auto', '.ProseMirror': proseMirrorStyles }}>
            <Box position="relative" style={{ minHeight: prevEditorHeight }}>
              <EditorContent editor={editor} />

              <CharacterCountContainer>
                {({ characterCount }) =>
                  typeof maxLength === 'undefined' || characterCount <= maxLength ? null : (
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      sx={{
                        pointerEvents: 'none',
                        color: 'transparent',
                        mark: {
                          color: theme.palette.error.main,
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      <EditorContent editor={shadowEditor} />
                    </Box>
                  )
                }
              </CharacterCountContainer>
            </Box>
          </Box>
        </Box>
      );
    }
  )
);

export default MarkdownInput;

type Offset = {
  x: string;
  y: string;
};

export interface MarkdownInputRefApi {
  value: string | undefined;
  focus: () => void;
  getLabelOffset: () => Offset;
}

interface MarkdownInputProps extends InputBaseComponentProps {
  maxLength?: number;
  hideImageOptions?: boolean;
  temporaryLocation?: boolean;
  controlsVisible?: 'always' | 'focused';
}
