/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Highlight } from '@tiptap/extension-highlight';
import { Placeholder } from '@tiptap/extension-placeholder';
import Document from '@tiptap/extension-document';
import { InputBaseComponentProps } from '@mui/material/InputBase/InputBase';
import { CharacterCountContainer, useSetCharacterCount } from './CharacterCountContext';
import MarkdownInputControls from '../MarkdownInputControls/MarkdownInputControls';
import { Iframe } from '../MarkdownInputControls/InsertEmbedCodeButton/Iframe';
import { useNotification } from '../../notifications/useNotification';
import usePersistentValue from '@/core/utils/usePersistentValue';
import UnifiedConverter from '@/core/ui/markdown/html/UnifiedConverter';
import { gutters } from '@/core/ui/grid/utils';
// Y.js and Hocuspocus imports for collaborative editing
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
// ProseMirror imports for editor state management
import { EditorState, Selection } from '@tiptap/pm/state';

interface CollaborativeMarkdownInputProps extends InputBaseComponentProps {
  controlsVisible?: 'always' | 'focused';
  maxLength?: number;
  hideImageOptions?: boolean;
  temporaryLocation?: boolean;
  placeholder?: string;
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
        placeholder,
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
      const [activeUsers, setActiveUsers] = useState<Array<{ name: string; color: string }>>([]);
      const [isInitialized, setIsInitialized] = useState(false);
      const [isSynced, setIsSynced] = useState(false);
      const [yjsContentVersion, setYjsContentVersion] = useState(0);
      const isInteractingWithInput = hasFocus || isControlsDialogOpen;

      const { HTMLToMarkdown, markdownToHTML } = usePersistentValue(UnifiedConverter());
      const { t } = useTranslation();
      const notify = useNotification();
      const theme = useTheme();

      // Create a ref to store the current _value and markdownToHTML
      const _valueRef = useRef(_value);
      const markdownToHTMLRef = useRef(markdownToHTML);

      const proseMirrorStyles = useMemo(
        () => ({
          outline: 'none',
          minHeight: gutters(4),
          padding: gutters(0.5),
          '& p:first-of-type': { marginTop: 0 },
          '& p:last-child': { marginBottom: 0 },
          '& ul, & ol': { paddingLeft: gutters(2) },
          '& blockquote': {
            paddingLeft: gutters(1),
            borderLeft: `${gutters(0.25)} solid ${theme.palette.divider}`,
          },
          '& pre': {
            backgroundColor: theme.palette.grey[100],
            padding: gutters(1),
            borderRadius: theme.spacing(0.5),
            fontFamily: 'monospace',
          },
          '& img': { maxWidth: '100%' },
        }),
        [theme]
      );

      // Update the refs whenever _value or markdownToHTML changes
      useEffect(() => {
        _valueRef.current = _value;
        markdownToHTMLRef.current = markdownToHTML;
      }, [_value, markdownToHTML]);

      // Initialize Y.js document and Hocuspocus provider
      useEffect(() => {
        const effectInstanceId = Date.now(); // Unique ID for this effect execution
        console.log(`[Effect ${effectInstanceId}] 🔄 Y.js/Hocuspocus init triggered. Props:`, {
          documentId: !!documentId,
          serverUrl: !!serverUrl,
          userId: userInfo?.userId,
          hasToken: !!token,
        });

        if (!documentId || !serverUrl || !userInfo?.userId) {
          console.warn(`[Effect ${effectInstanceId}] ⚠️ Missing critical props for Y.js/Hocuspocus. Bailing out.`, {
            docId: !!documentId,
            srvUrl: !!serverUrl,
            usrId: !!userInfo?.userId,
          });

          if (ydocRef.current) ydocRef.current = null;
          if (providerRef.current) providerRef.current = null;
          if (isInitialized) {
            console.log(`[Effect ${effectInstanceId}] Setting isInitialized to false due to bailing out.`);
            setIsInitialized(false);
          }
          if (isSynced) setIsSynced(false);
          if (isConnected) setIsConnected(false);
          return;
        }

        const _valueRef = useRef(_value);
        const markdownToHTMLRef = useRef(markdownToHTML);

        _valueRef.current = _value;
        markdownToHTMLRef.current = markdownToHTML;

        console.log(`[Effect ${effectInstanceId}] 👍 Props are present. Proceeding with Y.Doc creation.`);
        const localYDoc = new Y.Doc();
        ydocRef.current = localYDoc;
        console.log(
          `[Effect ${effectInstanceId}] 📄 Y.Doc created and ref set:`,
          !!ydocRef.current,
          'GUID:',
          localYDoc.guid
        );

        console.log(
          `[Effect ${effectInstanceId}] 🔌 Creating HocuspocusProvider instance with token:`,
          token ? 'present' : 'absent/undefined'
        );
        const localProvider = new HocuspocusProvider({
          url: serverUrl,
          name: documentId,
          document: localYDoc,
          token: token,
          onConnect: () => {
            console.log(`[Effect ${effectInstanceId}] ✅ HP Provider connected for doc:`, documentId);
            setIsConnected(true);
            notify(t('components.collaborative-editor.connected'), 'success');
          },
          onDisconnect: ({ event }) => {
            console.log(`[Effect ${effectInstanceId}] ❌ HP Provider disconnected for doc:`, documentId, event);
            setIsConnected(false);
            notify(t('components.collaborative-editor.disconnected'), 'warning');
          },
          onOpen: () => {
            console.log(`[Effect ${effectInstanceId}] 🔓 HP Provider connection opened for doc:`, documentId);
          },
          onClose: ({ event }) => {
            console.log(`[Effect ${effectInstanceId}] 🔒 HP Provider connection closed for doc:`, documentId, event);
          },
          onSynced: async () => {
            console.log(`[Effect ${effectInstanceId}] 🔄 HP Provider document synced with server:`, documentId);
            setIsSynced(true);

            setTimeout(async () => {
              const ytext = localYDoc.getText('content');
              console.log(`[Effect ${effectInstanceId}] 📄 Y.js text length after sync:`, ytext.length);
              console.log(
                `[Effect ${effectInstanceId}] 📄 Y.js text content after sync:`,
                ytext.toString().substring(0, 100)
              );

              if (ytext.length === 0 && _valueRef.current) {
                //  if (markdownToHTMLRef.current) {
                if (markdownToHTML) {
                  try {
                    const htmlContent = await markdownToHTML(_valueRef.current);
                    console.log(
                      `[Effect ${effectInstanceId}] 🔧 Initializing Y.js with HTML content:`,
                      htmlContent.substring(0, 100)
                    );
                    ytext.insert(0, htmlContent);
                    console.log(
                      `[Effect ${effectInstanceId}] ✅ Y.js text after HTML insert:`,
                      ytext.toString().substring(0, 100)
                    );
                  } catch (error) {
                    console.error(`[Effect ${effectInstanceId}] ❌ Error converting markdown to HTML:`, error);
                    ytext.insert(0, _valueRef.current); // Fallback to plain text
                    console.log(
                      `[Effect ${effectInstanceId}] ✅ Y.js text after fallback insert (error case):`,
                      ytext.toString().substring(0, 100)
                    );
                  }
                } else {
                  console.log(
                    `[Effect ${effectInstanceId}] 🔧 Initializing Y.js with plain text content (markdownToHTML not ready):`,
                    _valueRef.current.substring(0, 100)
                  );
                  ytext.insert(0, _valueRef.current);
                  console.log(
                    `[Effect ${effectInstanceId}] ✅ Y.js text after plain text insert:`,
                    ytext.toString().substring(0, 100)
                  );
                }
              } else if (ytext.length === 0 && _valueRef.current) {
                console.log(
                  `[Effect ${effectInstanceId}] 🔧 Initializing Y.js with plain text content (no markdownToHTML):`,
                  _valueRef.current.substring(0, 100)
                );
                ytext.insert(0, _valueRef.current);
                console.log(
                  `[Effect ${effectInstanceId}] ✅ Y.js text after plain text insert:`,
                  ytext.toString().substring(0, 100)
                );
                // }
              }

              ytext.observe(event => {
                console.log(
                  `[Effect ${effectInstanceId}] 🔄 Y.js text changed. Origin:`,
                  event.transaction.origin,
                  'New content:',
                  ytext.toString().substring(0, 100)
                );
                setYjsContentVersion(prev => prev + 1);
              });
            }, 100);
          },
          onAwarenessUpdate: ({ states }) => {
            console.log(`[Effect ${effectInstanceId}] 👥 Awareness update:`, states.length, 'total users');
            const users = Array.from(states.values())
              .filter((state: any) => state.user && state.user.userId !== userInfo!.userId) // userInfo is guarded by the effect's initial check
              .map((state: any) => ({
                name: state.user.name,
                color: state.user.color,
              }));
            console.log(`[Effect ${effectInstanceId}] 👤 Active users (excluding self):`, users);
            setActiveUsers(users);
          },
          onStateless: payload => {
            console.warn(`[Effect ${effectInstanceId}] 📡 HP received stateless message:`, payload);
          },
          onMessage: data => {
            console.log(`[Effect ${effectInstanceId}] 📨 HP message received:`, data);
          },
          onOutgoingMessage: data => {
            console.log(`[Effect ${effectInstanceId}] 📤 HP message sent:`, data);
          },
        });
        providerRef.current = localProvider;
        console.log(`[Effect ${effectInstanceId}] 🔗 HP Provider created and ref set:`, !!providerRef.current);

        if (ydocRef.current && providerRef.current) {
          console.log(`[Effect ${effectInstanceId}] ✅ Refs are set. Setting isInitialized to true.`);
          setIsInitialized(true);
        } else {
          console.error(`[Effect ${effectInstanceId}] ❌ Critical: Refs NOT set after creation! This is unexpected.`, {
            hasYdoc: !!ydocRef.current,
            hasProvider: !!providerRef.current,
          });
          if (isInitialized) setIsInitialized(false);
        }

        return () => {
          console.log(`[Effect ${effectInstanceId}] 🧹 Cleanup running. Destroying provider and ydoc.`);
          localProvider?.destroy();
          localYDoc?.destroy();
          ydocRef.current = null;
          providerRef.current = null;

          setIsInitialized(false);
          setIsSynced(false);
          setIsConnected(false);
          // setYjsContentVersion(0); // Consider if this reset is needed or too disruptive
          // setActiveUsers([]); // UI state, consider if reset here is best
          console.log(`[Effect ${effectInstanceId}] 🧹 Cleanup finished. isInitialized is now false.`);
        };
      }, [documentId, serverUrl, token, userInfo?.userId, _value, markdownToHTML, notify, t]); // Added notify and t as they are used in callbacks.
      // _value and markdownToHTML are dependencies for the onSynced logic.
      // If they change, the effect should re-evaluate if it needs to re-initialize
      // or if the onSynced logic needs to be updated.
      // For provider stability, it's often better to pass stable callbacks or use refs for such values if they change often.
      // Reverting to minimal dependencies for provider creation itself:
      // [documentId, serverUrl, token, userInfo?.userId, notify, t]
      // _value and markdownToHTML are used in onSynced, which is a callback.
      // The provider itself doesn't depend on them for its existence.
      // Let's stick to the original dependencies for the effect that creates the provider,
      // and ensure callbacks handle potentially changing values correctly (closures).
      // Original: [documentId, serverUrl, token, userInfo?.userId]
      // Adding notify and t because they are used in onConnect/onDisconnect.
      // Final decision for dependency array: [documentId, serverUrl, token, userInfo?.userId, notify, t, _value, markdownToHTML]
      // The onSynced logic directly uses _value and markdownToHTML. If these change, and the document was empty,
      // it might be desirable to re-populate. This implies the effect should re-run.
      // However, re-running the entire effect (destroying and recreating provider) for _value change is heavy.
      // A better pattern would be to have a separate effect for initial population if _value changes and doc is empty.
      // For now, to ensure callbacks have fresh values and to match closer to original intent of including what's used:
      // Let's use [documentId, serverUrl, token, userInfo?.userId, notify, t]
      // And handle _value/markdownToHTML within onSynced using refs or by ensuring they are stable.
      // The safest minimal set for provider creation and its direct callbacks is:
      // [documentId, serverUrl, token, userInfo?.userId, notify, t]
      // The _value and markdownToHTML are used in an async callback (setTimeout in onSynced).
      // React's default lint rules would ask for them.
      // Let's keep them for now to avoid stale closures in onSynced,
      // accepting the consequence of re-initialization if they change.
      // This is often a trade-off.
      // The most critical part is `documentId, serverUrl, token, userInfo?.userId` for the provider itself.
      // Create editor options as soon as Y.js is initialized (don't wait for sync)
      const editorOptions = useMemo(() => {
        // Don't create editor until Y.js document and provider are initialized
        if (!isInitialized || !ydocRef.current || !providerRef.current) {
          console.log('⏳ Waiting for Y.js initialization:', {
            isInitialized,
            hasYdoc: !!ydocRef.current,
            hasProvider: !!providerRef.current,
          });
          return null;
        }

        console.log('🤝 Creating editor options (sync status:', isSynced ? 'synced' : 'not yet synced', ')');

        // Get Y.js text content for initial value
        const ydoc = ydocRef.current;
        const ytext = ydoc.getText('content');
        const yjsContent = ytext.toString();

        console.log('📄 Y.js content for editor:', {
          yjsLength: yjsContent.length,
          yjsContent: yjsContent.substring(0, 100) + (yjsContent.length > 100 ? '...' : ''),
        });

        const collaborationExtension = Collaboration.configure({
          document: ydoc,
          field: 'content',
        });

        const collaborationCursorExtension = CollaborationCursor.configure({
          provider: providerRef.current,
          user: userInfo,
        });

        console.log('🔗 Created collaboration extensions:', {
          collaboration: !!collaborationExtension,
          cursor: !!collaborationCursorExtension,
          ydocId: ydoc.clientID,
          providerConnected: providerRef.current?.synced,
        });

        return {
          extensions: [
            // Document extension must come first to define the schema's top node
            Document,
            StarterKit.configure({
              // Disable the default history extension since we'll use collaboration history
              history: false,
              // Disable StarterKit's document since we're using the explicit Document extension
              document: false,
            }),
            Placeholder.configure({
              placeholder: placeholder || 'Start typing...',
            }),
            ImageExtension,
            Link,
            Highlight,
            Iframe,
            collaborationExtension,
            collaborationCursorExtension,
          ],
          // Use Y.js content as initial content if available
          content: yjsContent || '<p></p>', // Ensure there's always valid content
        };
      }, [isInitialized, placeholder, userInfo, yjsContentVersion]);

      // Create the editor only when collaboration is ready
      // const editor = useEditor(editorOptions || undefined, []);

      // const editor = useMemo(() => {
      //   if (!editorOptions) return null;
      //   return new Editor(editorOptions);
      // }, [editorOptions]);

      const editor = useEditor(editorOptions ? { ...editorOptions } : undefined);

      // Debug editor configuration when it's created
      useEffect(() => {
        if (editor) {
          console.log('🎯 Editor created with extensions:', {
            extensionNames: editor.extensionManager.extensions.map(ext => ext.name),
            hasCollaboration: editor.extensionManager.extensions.some(ext => ext.name === 'collaboration'),
            collaborationConfig: editor.extensionManager.extensions.find(ext => ext.name === 'collaboration')?.options,
          });

          // Check if collaboration extension is properly bound to Y.js
          const collaborationExt = editor.extensionManager.extensions.find(ext => ext.name === 'collaboration');
          if (collaborationExt) {
            console.log('🔗 Collaboration extension config:', {
              field: collaborationExt.options.field,
              document: collaborationExt.options.document === ydocRef.current,
              documentGuid: collaborationExt.options.document?.guid,
              yjsGuid: ydocRef.current?.guid,
            });
          } else {
            console.warn('❌ No collaboration extension found in editor!');
          }
        }
      }, [editor]);

      // Simple sync monitoring (only in development)
      useEffect(() => {
        if (!editor || !isSynced || !ydocRef.current || process.env.NODE_ENV === 'production') return;

        const interval = setInterval(() => {
          const ytext = ydocRef.current!.getText('content');
          const yjsContent = ytext.toString();
          const editorContent = editor.getText();

          if (yjsContent !== editorContent) {
            console.warn('🔍 Sync difference detected:', {
              yjsLength: yjsContent.length,
              editorLength: editorContent.length,
              hasCollaboration: editor.extensionManager.extensions.some(ext => ext.name === 'collaboration'),
            });
          }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
      }, [editor, isSynced]);

      // Shadow editor for overflow highlighting
      const shadowEditor = useEditor(
        {
          extensions: [
            Document.configure({}),
            StarterKit.configure({
              document: false, // Disable StarterKit's document since we're using the explicit Document extension
            }),
            ImageExtension,
            Link,
            Highlight,
            Iframe,
          ],
          content: '<p></p>', // Provide valid initial content
          editable: false,
        },
        []
      );

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
          const editorText = editor.getText();
          const editorHTML = editor.getHTML();
          const yjsText = ydocRef.current?.getText('content').toString() || '';

          console.log('✏️  Editor content changed:', {
            editorTextLength: editorText.length,
            yjsTextLength: yjsText.length,
            lengthDiff: editorText.length - yjsText.length,
            editorFirstChars: editorText.substring(0, 50) + '...',
            yjsFirstChars: yjsText.substring(0, 50) + '...',
            htmlLength: editorHTML.length,
          });

          // WARNING: If editor content exceeds Y.js content, we have a sync problem
          if (editorText.length > yjsText.length && yjsText.length > 0) {
            console.error('🚨 SYNC ISSUE: Editor content exceeds Y.js content!', {
              editorLength: editorText.length,
              yjsLength: yjsText.length,
              difference: editorText.length - yjsText.length,
            });
          }

          let markdown = await HTMLToMarkdown(editorHTML);
          markdown = wrapIframeWithStyledDiv(markdown);
          setCharacterCount(editorText.length);

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
      const handleDialogClose = useCallback(() => setIsControlsDialogOpen(false), []);

      return (
        <Box ref={containerRef} width="100%" onFocus={handleFocus} onBlur={handleBlur}>
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <Box mb={1} p={1} bgcolor="grey.100" fontSize="0.75rem" fontFamily="monospace">
              <div>📄 Document ID: {documentId}</div>
              <div>🔗 Server URL: {serverUrl}</div>
              <div>👤 User ID: {userInfo.userId}</div>
              <div>🏗️ Initialized: {isInitialized ? '✅' : '❌'}</div>
              <div>🔄 Synced: {isSynced ? '✅' : '❌'}</div>
              <div>🔌 Connected: {isConnected ? '✅' : '❌'}</div>
              <div>📝 Y.js Content Length: {ydocRef.current?.getText('content').length || 0}</div>
              <div>✏️ Editor Content Length: {editor?.getText().length || 0}</div>
              <div
                style={{
                  color:
                    (editor?.getText().length || 0) > (ydocRef.current?.getText('content').length || 0)
                      ? 'red'
                      : 'green',
                }}
              >
                🔄 Sync Status:{' '}
                {!editor
                  ? 'No Editor'
                  : !ydocRef.current
                    ? 'No Y.js Doc'
                    : editor.getText().length === ydocRef.current.getText('content').length
                      ? '✅ In Sync'
                      : '❌ Out of Sync'}
              </div>
              <div>
                🧩 Has Collaboration Ext:{' '}
                {editor?.extensionManager.extensions.some(ext => ext.name === 'collaboration') ? '✅' : '❌'}
              </div>
              <div>👥 Active Users: {activeUsers.length}</div>
            </Box>
          )}

          {/* Connection status and active users */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={8} height={8} borderRadius="50%" bgcolor={isConnected ? 'success.main' : 'error.main'} />
              <Box component="span" fontSize="0.75rem" color="text.secondary">
                {!isInitialized
                  ? t('components.collaborative-editor.initializing', 'Initializing...')
                  : !isSynced
                    ? t('components.collaborative-editor.syncing', 'Syncing...')
                    : isConnected
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

          {!editor ? (
            <Box
              width="100%"
              minHeight={gutters(4)}
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="text.secondary"
              fontSize="0.875rem"
            >
              {t('components.collaborative-editor.loading', 'Loading collaborative editor...')}
            </Box>
          ) : (
            <>
              <MarkdownInputControls
                ref={toolbarRef}
                editor={editor}
                visible={areControlsVisible()}
                hideImageOptions={hideImageOptions}
                onDialogOpen={handleDialogOpen}
                onDialogClose={handleDialogClose}
                temporaryLocation={temporaryLocation}
                isCollaborative
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
            </>
          )}
        </Box>
      );
    }
  )
);

export default CollaborativeMarkdownInput;
