import React, {
  FormEvent,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Box, lighten, useTheme } from '@mui/material';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { InputBaseComponentProps } from '@mui/material/InputBase/InputBase';
import { CharacterCountContainer, useSetCharacterCount } from './CharacterCountContext';
import MarkdownInputControls from '../MarkdownInputControls/MarkdownInputControls';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import usePersistentValue from '../../../utils/usePersistentValue';
import UnifiedConverter from '../../markdown/html/UnifiedConverter';
import { gutters } from '../../grid/utils';
import { EditorState } from '@tiptap/pm/state';
import { Highlight } from '@tiptap/extension-highlight';
import { Selection } from 'prosemirror-state';
import { EditorOptions } from '@tiptap/core';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { useUserContext } from '../../../../domain/community/contributor/user';
import { useConfig } from '../../../../domain/platform/config/useConfig';
import { Caption } from '../../typography';

interface MarkdownInputProps extends InputBaseComponentProps {
  controlsVisible?: 'always' | 'focused';
  collaborationRoomId: string;
  maxLength?: number;
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
  '& .collaboration-cursor__caret::before': {
    content: '" "',
    position: 'absolute',
    left: gutters(-1),
    borderLeft: '1px solid red',
    height: gutters(),
  },
  '& .collaboration-cursor__caret': {
    position: 'relative',
    display: 'inline-block',
    marginLeft: gutters(),
  },
} as const;

const editorSettings: Partial<EditorOptions> = {
  extensions: [StarterKit, ImageExtension, Link, Highlight],
};

type CollaborationParams =
  | {
      collaborationEnabled: true;
      ydoc: Y.Doc;
      provider: HocuspocusProvider;
    }
  | {
      collaborationEnabled: false;
      ydoc: undefined;
      provider: undefined;
    };

export const MarkdownInput = forwardRef<MarkdownInputRefApi, MarkdownInputProps>(
  ({ value, onChange, collaborationRoomId, maxLength, controlsVisible = 'focused', onFocus, onBlur }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);

    const { platform } = useConfig();
    const { ydoc, provider, collaborationEnabled } = useMemo<CollaborationParams>(() => {
      if (!collaborationRoomId) {
        console.log('no collaborationRoomId');
        return { collaborationEnabled: false };
      }
      console.log('Collaboration enabled');
      const ydoc = new Y.Doc();
      return {
        collaborationEnabled: true,
        ydoc,
        provider: new HocuspocusProvider({
          url: 'ws://127.0.0.1:8081', // platform?....
          name: collaborationRoomId,
          document: ydoc,
          onStatus: ({ status }) => {
            console.log('onStatus', status);
          },
          onMessage: data => {
            const decoder = data.message.decoder;
            console.log('onMessage', data, new TextDecoder().decode(data.message.decoder.arr));
          },
          onSynced: ({ state }) => {
            console.log('onSynced', state);
          },
          onAwarenessUpdate: ({ states }) => {
            setRoomUsers(states.length);
            console.log('onAwarenessUpdate', states);
          },
          onAwarenessChange: data => {
            console.log('onAwarenessChange', data);
          },
        }),
      };
    }, [platform, collaborationRoomId]);

    const [roomUsers, setRoomUsers] = useState(0);
    //provider?.send()
    const [hasFocus, setHasFocus] = useState(false);
    const [isControlsDialogOpen, setIsControlsDialogOpen] = useState(false);
    const isInteractingWithInput = hasFocus || isControlsDialogOpen;

    const [htmlContent, setHtmlContent] = useState('');

    const { markdownToHTML, HTMLToMarkdown } = usePersistentValue(UnifiedConverter());

    const updateHtmlContent = async () => {
      console.log('updateHtmlContent', value);
      const content = await markdownToHTML(value);
      setHtmlContent(String(content));
    };
    const { user, loading } = useUserContext();

    const builtEditorSettings = useMemo<Partial<EditorOptions>>(() => {
      console.log('build EditorSettings');
      if (!collaborationEnabled) {
        console.log('no collaboration id');
        return {
          extensions: [StarterKit, ImageExtension, Link, Highlight],
        };
      } else {
        console.log('settings with collab');
        return {
          extensions: [
            StarterKit.configure({ history: false }),
            ImageExtension,
            Link,
            Highlight,
            Collaboration.configure({
              document: ydoc,
            }),
            CollaborationCursor.configure({
              provider,
              user: { name: user?.user.profile.displayName, color: '#ffcc00' },
            }),
          ],
        };
      }
    }, [ydoc, user, loading, collaborationRoomId]);

    const editor = useEditor(
      {
        ...builtEditorSettings,
        content: htmlContent,
      },
      [htmlContent]
    );

    useEffect(
      () => () => {
        if (collaborationEnabled) {
          console.log('leave the collaboration room');
          provider?.destroy();
          editor?.destroy(); // probably not needed
        }
      },
      []
    );

    // Currently used to highlight overflow but can be reused for other similar features as well
    const shadowEditor = useEditor({
      ...editorSettings,
      content: '',
      editable: false,
    });

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
          ref={toolbarRef}
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
                        color: theme.palette.background.paper,
                        backgroundColor: lighten(theme.palette.negative.main, 0.2),
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
        <Box textAlign="right" color="red">
          <Caption>{roomUsers} clients</Caption>
        </Box>
      </Box>
    );
  }
);

export default MarkdownInput;
