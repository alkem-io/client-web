import React, {
  FormEvent,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import { Box, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { InputBaseComponentProps } from '@mui/material/InputBase/InputBase';
import { CharacterCountContainer, useSetCharacterCount } from './CharacterCountContext';
import MarkdownInputControls from '../MarkdownInputControls/MarkdownInputControls';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import usePersistentValue from '@/core/utils/usePersistentValue';
import UnifiedConverter from '@/core/ui/markdown/html/UnifiedConverter';
import { gutters } from '@/core/ui/grid/utils';
import { EditorState } from '@tiptap/pm/state';
import { Highlight } from '@tiptap/extension-highlight';
import { Selection } from 'prosemirror-state';
import { EditorOptions } from '@tiptap/core';
import { Iframe } from '../MarkdownInputControls/InsertEmbedCodeButton/Iframe';
import { EditorView } from '@tiptap/pm/view';
import { useStorageConfigContext } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useUploadFileMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '../../notifications/useNotification';

interface MarkdownInputProps extends InputBaseComponentProps {
  controlsVisible?: 'always' | 'focused';
  maxLength?: number;
  hideImageOptions?: boolean;
  temporaryLocation?: boolean;
}

type Offset = {
  x: string;
  y: string;
};

export interface MarkdownInputRefApi {
  focus: () => void;
  value: string | undefined;
  getLabelOffset: () => Offset;
}

const ImageExtension = Image.configure({ inline: true });

const proseMirrorStyles = {
  outline: 'none',
  minHeight: gutters(4),
  padding: gutters(0.5),
  '& p:first-child': { marginTop: 0 },
  '& p:last-child': { marginBottom: 0 },
  '& img': { maxWidth: '100%' },
} as const;

export const MarkdownInput = memo(
  forwardRef<MarkdownInputRefApi, MarkdownInputProps>(
    (
      {
        value,
        onChange,
        maxLength,
        controlsVisible = 'focused',
        hideImageOptions,
        onFocus,
        onBlur,
        temporaryLocation = false,
      },
      ref
    ) => {
      const containerRef = useRef<HTMLDivElement>(null);
      const toolbarRef = useRef<HTMLDivElement>(null);

      const [hasFocus, setHasFocus] = useState(false);
      const [isControlsDialogOpen, setIsControlsDialogOpen] = useState(false);
      const isInteractingWithInput = hasFocus || isControlsDialogOpen;

      const [htmlContent, setHtmlContent] = useState('');

      const { markdownToHTML, HTMLToMarkdown } = usePersistentValue(UnifiedConverter());

      const updateHtmlContent = async () => {
        const content = await markdownToHTML(value);
        setHtmlContent(String(content));
      };

      const { t } = useTranslation();

      const notify = useNotification();

      const [uploadFile] = useUploadFileMutation({
        onCompleted: data => {
          notify(t('components.file-upload.file-upload-success'), 'success');

          editor?.commands.setImage({ src: data.uploadFileOnStorageBucket, alt: 'pasted-image' });
        },

        onError: error => {
          console.error(error.message);
        },
      });

      const isImageOrHtmlWithImage = (item: DataTransferItem, clipboardData: DataTransfer | null) => {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          return true; // Image
        }

        if (item.kind === 'string' && item.type === 'text/html') {
          const htmlContent = clipboardData?.getData('text/html');
          return htmlContent?.includes('<img') ?? false; // HTML tag with image
        }

        return false; // Not an image or HTML with images
      };

      const storageConfig = useStorageConfigContext();

      const editorOptions: Partial<EditorOptions> = useMemo(
        () => ({
          extensions: [StarterKit, ImageExtension, Link, Highlight, Iframe],
          editorProps: {
            /**
             * Handles the paste event in the editor.
             *
             * @param _view - The editor view instance.
             * @param event - The clipboard event triggered by pasting.
             * @returns {boolean} - Returns true if the paste event is handled, otherwise false - continue execution of the default.
             */
            handlePaste: (_view: EditorView, event: ClipboardEvent): boolean => {
              const clipboardData = event.clipboardData;
              const items = clipboardData?.items;

              if (!items) {
                return false;
              }

              const storageBucketId = storageConfig?.storageBucketId;

              if (!storageBucketId) {
                return false;
              }

              let imageProcessed = false;

              for (const item of items) {
                const isImage = isImageOrHtmlWithImage(item, clipboardData);

                if (hideImageOptions && isImage) {
                  event.preventDefault();

                  return true; // Block paste of images or HTML with images
                }

                if (!imageProcessed && isImage) {
                  if (item.kind === 'file' && item.type.startsWith('image/')) {
                    const file = item.getAsFile();

                    if (file) {
                      const reader = new FileReader();

                      reader.onload = () => {
                        uploadFile({
                          variables: {
                            file,
                            uploadData: { storageBucketId, temporaryLocation },
                          },
                        });
                      };

                      reader.readAsDataURL(file);
                      imageProcessed = true;
                    }
                  } else if (item.kind === 'string' && item.type === 'text/html') {
                    imageProcessed = true; // HTML with images
                  }
                }

                if (imageProcessed) {
                  // Stop if we have already processed an image
                  break;
                }
              }

              if (imageProcessed) {
                event.preventDefault();

                return true; // Block default behavior for images
              }

              return false; // Allow default behavior for text
            },
          },
        }),
        [storageConfig, temporaryLocation, uploadFile]
      );

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

      const wrapIframeWithStyledDiv = (markdown: string): string =>
        markdown.replace(
          /<iframe[^>]*><\/iframe>/g,
          iframe =>
            `<div style='position: relative; padding-bottom: 56.25%; width: 100%; overflow: hidden; border-radius: 8px; margin-bottom: 10px;'>${iframe}</div>`
        );

      const emitChangeOnEditorUpdate = (editor: Editor) => {
        const handleStateChange = async () => {
          let markdown = await HTMLToMarkdown(editor.getHTML());

          markdown = wrapIframeWithStyledDiv(markdown);

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
        <Box ref={containerRef} width="100%" onFocus={handleFocus} onBlur={handleBlur}>
          <MarkdownInputControls
            ref={toolbarRef}
            editor={editor}
            visible={areControlsVisible()}
            hideImageOptions={hideImageOptions}
            onDialogOpen={handleDialogOpen}
            onDialogClose={handleDialogClose}
            temporaryLocation={temporaryLocation}
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
                      bottom={0}
                      right={0}
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
