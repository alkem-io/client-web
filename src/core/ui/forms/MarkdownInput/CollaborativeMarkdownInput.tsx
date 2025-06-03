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
import { Collaboration } from '@tiptap/extension-collaboration';
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor';
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
import { useNotification } from '../../notifications/useNotification';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';

interface CollaborativeMarkdownInputProps extends InputBaseComponentProps {
  controlsVisible?: 'always' | 'focused';
  maxLength?: number;
  hideImageOptions?: boolean;
  temporaryLocation?: boolean;
  // Collaboration props
  documentId: string;
  serverUrl: string;
  userInfo: {
    name: string;
    color: string;
    userId: string;
  };
  token?: string;
}

type Offset = {
  x: string;
  y: string;
};

export interface CollaborativeMarkdownInputRefApi {
  focus: () => void;
  value: string | undefined;
  getLabelOffset: () => Offset;
}

const ImageExtension = Image.configure({ inline: true });

const proseMirrorStyles = {
  outline: 'none',
  minHeight: gutters(4),
  padding: gutters(0.5),
  '& p:first-of-type': { marginTop: 0 },
  '& p:last-child': { marginBottom: 0 },
  '& ul, & ol': { paddingLeft: gutters(2) },
  '& blockquote': {
    paddingLeft: gutters(1),
    borderLeft: theme => `${gutters(0.25)} solid ${theme.palette.divider}`,
  },
  '& pre': {
    backgroundColor: theme => theme.palette.grey[100],
    padding: gutters(1),
    borderRadius: theme => theme.spacing(0.5),
    fontFamily: 'monospace',
  },
  '& img': { maxWidth: '100%' },
} as const;

export const CollaborativeMarkdownInput = memo(
  forwardRef<CollaborativeMarkdownInputRefApi, CollaborativeMarkdownInputProps>(
    (
      {
        value: _value,
        onChange,
        maxLength,
        controlsVisible = 'focused',
        hideImageOptions,
        onFocus,
        onBlur,
        temporaryLocation = false,
        documentId,
        serverUrl,
        userInfo,
        token,
      },
      ref
    ) => {
      const containerRef = useRef<HTMLDivElement>(null);
      const toolbarRef = useRef<HTMLDivElement>(null);
      const providerRef = useRef<HocuspocusProvider | null>(null);
      const ydocRef = useRef<Y.Doc | null>(null);

      const [hasFocus, setHasFocus] = useState(false);
      const [isControlsDialogOpen, setIsControlsDialogOpen] = useState(false);
      const [isConnected, setIsConnected] = useState(false);
      const [activeUsers] = useState<Array<{ name: string; color: string }>>([]);
      const isInteractingWithInput = hasFocus || isControlsDialogOpen;

      const { HTMLToMarkdown } = usePersistentValue(UnifiedConverter());
      const { t } = useTranslation();
      const notify = useNotification();

      // Initialize Y.js document and Hocuspocus provider
      useEffect(() => {
        const ydoc = new Y.Doc();
        ydocRef.current = ydoc;

        const provider = new HocuspocusProvider({
          url: serverUrl,
          name: documentId,
          document: ydoc,
          token: token,
          onConnect: () => {
            setIsConnected(true);
            notify(t('components.collaborative-editor.connected'), 'success');
          },
          onDisconnect: () => {
            setIsConnected(false);
            notify(t('components.collaborative-editor.disconnected'), 'warning');
          },
        });

        providerRef.current = provider;

        return () => {
          provider.destroy();
          ydoc.destroy();
        };
      }, [documentId, serverUrl, token]);

      const editorOptions: Partial<EditorOptions> = useMemo(
        () => ({
          extensions: [
            StarterKit.configure({
              // Disable the default history extension since we're using collaboration
              history: false,
            }),
            ImageExtension,
            Link,
            Highlight,
            Iframe,
            Collaboration.configure({
              document: ydocRef.current,
            }),
            CollaborationCursor.configure({
              provider: providerRef.current,
              user: userInfo,
            }),
          ],
        }),
        [userInfo]
      );

      const editor = useEditor(editorOptions);

      // Shadow editor for overflow highlighting
      const shadowEditor = useEditor({
        extensions: [StarterKit, ImageExtension, Link, Highlight, Iframe],
        content: '',
        editable: false,
      });

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
          } catch (_error) {
            // Failed to update shadow editor state - could add error handling here if needed
          }

          const end = Selection.atEnd(shadowEditor.state.doc).from;
          const overflow = contentLength - maxLength;

          shadowEditor
            .chain()
            .setTextSelection({
              from: end - overflow,
              to: end,
            })
            .setHighlight()
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
          if (containerRef.current) {
            containerRef.current.scrollTop = 0;
          }
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
          {/* Connection status and active users */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={8} height={8} borderRadius="50%" bgcolor={isConnected ? 'success.main' : 'error.main'} />
              <Box component="span" fontSize="0.75rem" color="text.secondary">
                {isConnected
                  ? t('components.collaborative-editor.connected')
                  : t('components.collaborative-editor.disconnected')}
              </Box>
            </Box>
            {activeUsers.length > 0 && (
              <Box display="flex" alignItems="center" gap={0.5}>
                {activeUsers.map((user, index) => (
                  <Box
                    key={index}
                    width={20}
                    height={20}
                    borderRadius="50%"
                    bgcolor={user.color}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="0.6rem"
                    color="white"
                    fontWeight="bold"
                    title={user.name}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Box>
                ))}
              </Box>
            )}
          </Box>

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

export default CollaborativeMarkdownInput;
