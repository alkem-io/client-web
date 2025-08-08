import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState, useMemo } from 'react';
import { Box, BoxProps, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Editor, EditorContent, Extensions, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { InputBaseComponentProps } from '@mui/material/InputBase/InputBase';
import MarkdownInputControls from '../MarkdownInputControls/MarkdownInputControls';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { gutters } from '@/core/ui/grid/utils';
import { Highlight } from '@tiptap/extension-highlight';
import { Iframe } from '../MarkdownInputControls/InsertEmbedCodeButton/Iframe';
import { EditorView } from '@tiptap/pm/view';
import { useUploadFileMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '../../notifications/useNotification';
import Collaboration from '@tiptap/extension-collaboration';
import { TiptapCollabProvider, onStatelessParameters } from '@hocuspocus/provider';
import * as Y from 'yjs';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { EditorOptions } from '@tiptap/core';
import useUserCursor from './useUserCursor';
import './styles.scss';
import { isEqual } from 'lodash';
import {
  CollaborationStatus,
  RealTimeCollaborationState,
  isCollaborationStatus,
  MemoStatus,
} from '@/domain/collaboration/realTimeCollaboration/RealTimeCollaborationState';
import { env } from '@/main/env';
import {
  isStatelessSaveMessage,
  isStatelessReadOnlyStateMessage,
  isStatelessSaveErrorMessage,
} from './stateless-messaging';
import { decodeStatelessMessage } from './stateless-messaging/util';
import { warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';

interface MarkdownInputProps extends InputBaseComponentProps {
  controlsVisible?: 'always' | 'focused';
  maxLength?: number;
  height: BoxProps['height'];
  hideImageOptions?: boolean;
  temporaryLocation?: boolean;
  collaborationId?: string;
  onChangeCollaborationState?: (state: RealTimeCollaborationState) => void;
  disabled?: boolean;
  storageBucketId: string;
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
  '& p:first-of-type': { marginTop: 0 },
  '& p:last-child': { marginBottom: 0 },
  '& img': { maxWidth: '100%' },
} as const;

const MEMO_SERVICE_URL = `${env?.VITE_APP_COLLAB_DOC_URL}${env?.VITE_APP_COLLAB_DOC_PATH}`;

export const CollaborativeMarkdownInput = memo(
  forwardRef<MarkdownInputRefApi, MarkdownInputProps>(
    (
      {
        controlsVisible = 'focused',
        hideImageOptions,
        height,
        onFocus,
        onBlur,
        temporaryLocation,
        collaborationId,
        onChangeCollaborationState,
        disabled,
        storageBucketId,
      },
      ref
    ) => {
      const containerRef = useRef<HTMLDivElement>(null);
      const toolbarRef = useRef<HTMLDivElement>(null);

      const { userName, cursorColor } = useUserCursor();

      const [status, setStatus] = useState<CollaborationStatus>(MemoStatus.CONNECTING);
      const [synced, setSynced] = useState(false);

      const [hasFocus, setHasFocus] = useState(false);
      const [isControlsDialogOpen, setIsControlsDialogOpen] = useState(false);
      const isInteractingWithInput = hasFocus || isControlsDialogOpen;

      const { t } = useTranslation();

      const notify = useNotification();

      const [uploadFile] = useUploadFileMutation({
        onCompleted: data => {
          notify(t('components.file-upload.file-upload-success'), 'success');

          editor?.commands.setImage({ src: data.uploadFileOnStorageBucket, alt: 'pasted-image' });
        },
      });

      const isImageOrHtmlWithImage = (item: DataTransferItem, clipboardData: DataTransfer | null) => {
        if (item.type.startsWith('image/') || (item.kind === 'file' && item.type.startsWith('image/'))) {
          return true; // Image
        }

        if (item.kind === 'string' && item.type === 'text/html') {
          const htmlContent = clipboardData?.getData('text/html');
          return htmlContent?.includes('<img') ?? false; // HTML tag with image
        }

        return false; // Not an image or HTML with images
      };

      /**
       * Handles the paste event in the editor.
       *
       * @param _view - The editor view instance.
       * @param event - The clipboard event triggered by pasting.
       * @returns {boolean} - Returns true if the paste event is handled, otherwise false - continue execution of the default.
       *
       * Reference to alternative way of handling paste events in Tiptap: https://tiptap.dev/docs/editor/extensions/functionality/filehandler
       *
       */
      const handlePaste = useCallback(
        (_view: EditorView, event: ClipboardEvent): boolean => {
          if (!storageBucketId) {
            return false; // Allow default behavior for text
          }

          const clipboardData = event.clipboardData;
          const items = clipboardData?.items;

          if (!items) {
            return false; // Allow default behavior for text
          }

          const itemsArray = Array.from(items); // Keep `Array.from` since if any kind of `for` loop is used it will iterate only over one item.

          itemsArray.forEach(item => {
            const isImage = isImageOrHtmlWithImage(item, clipboardData);

            if (hideImageOptions && isImage) {
              event.preventDefault();
              return true; // Block paste of images or HTML with images
            }

            if (isImage) {
              const file = item.getAsFile();

              if (file) {
                const reader = new FileReader();

                reader.onload = () => {
                  uploadFile({ variables: { file, uploadData: { storageBucketId, temporaryLocation } } });
                };

                reader.readAsDataURL(file);
                event.preventDefault();
                return true; // Block default behavior for images
              }
            }
          });

          return false; // Allow default behavior for text
        },
        [storageBucketId, hideImageOptions, temporaryLocation, uploadFile]
      );

      const ydoc = useMemo(() => new Y.Doc(), []);
      const providerRef = useRef<TiptapCollabProvider | null>(null);

      useEffect(() => {
        providerRef.current = new TiptapCollabProvider({
          baseUrl: MEMO_SERVICE_URL,
          name: collaborationId,
          document: ydoc,
        });

        const syncHandler = event => {
          setSynced(!!event.state);
        };

        let wasPreviouslyDisconnected = !synced;
        const statusHandler = event => {
          // logic to fix missing sync after reconnecting
          if (event.status === MemoStatus.DISCONNECTED || event.status === MemoStatus.CONNECTING) {
            setSynced(false);
            wasPreviouslyDisconnected = true;
          }
          if (event.status === MemoStatus.CONNECTED && wasPreviouslyDisconnected) {
            providerRef.current?.forceSync();
          }

          if (isCollaborationStatus(event.status)) {
            setStatus(event.status);
          } else {
            logWarn('UnknownMemoStatusError', { category: TagCategoryValues.MEMO, label: `Status: ${event.status}` });
          }
        };

        const statelessEventHandler = ({ payload }: onStatelessParameters) => {
          const decodedMessage = decodeStatelessMessage(payload);
          if (!decodedMessage) {
            return;
          }

          if (isStatelessSaveMessage(decodedMessage)) {
            if (isStatelessSaveErrorMessage(decodedMessage)) {
              // TODO:MEMO better error handling + retry logic
              notify('Unable to save changes', 'warning');
            } else {
              setLastSaveTime(new Date());
            }
          } else if (isStatelessReadOnlyStateMessage(decodedMessage)) {
            // TODO:MEMO handle read-only codes: see enum ReadOnlyCode
            setIsReadOnly(decodedMessage.readOnly);
          }
        };

        const authenticationFailedHandler = () => {
          // event.reason available
          // As the user is actually authenticated on the platform
          // this error is most likely not-relevant,
          // so we show the notSynced state with a message to reload
          setSynced(false);
        };

        // doc for the events: https://tiptap.dev/docs/collaboration/provider/events
        // provides MemoStatus updates
        providerRef.current.on('status', statusHandler);

        // explicit sync event
        // connected is not enough sometimes you're connected, but not synced
        // editing should not be allowed until synced
        providerRef.current.on('synced', syncHandler);
        providerRef.current.on('authenticationFailed', authenticationFailedHandler);
        // passing custom messages
        providerRef.current.on('stateless', statelessEventHandler);

        return () => {
          providerRef.current?.destroy();
        };
      }, [ydoc]);

      const editorOptions: Partial<EditorOptions> = useMemo(() => {
        const extensions: Extensions = [StarterKit, ImageExtension, Link, Highlight, Iframe];

        if (providerRef.current) {
          extensions.push(
            Collaboration.extend().configure({
              document: ydoc,
            }),
            CollaborationCursor.extend().configure({
              provider: providerRef.current,
              user: {
                name: userName,
                color: cursorColor,
              },
            })
          );
        }

        return {
          extensions,
          editorProps: { handlePaste },
          enableContentCheck: true,
          onContentError: ({ disableCollaboration }) => {
            disableCollaboration();
          },
          editable: !disabled,
        };
      }, [providerRef.current, ydoc, userName, cursorColor, handlePaste, disabled]);

      const editor = useEditor(editorOptions, [editorOptions]);

      const theme = useTheme();

      const areControlsVisible = () => {
        if (disabled) {
          return false;
        }
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

      const [currentCollaborationState, setCollaborationState] = useState<RealTimeCollaborationState>();
      const [lastSaveTime, setLastSaveTime] = useState<Date | undefined>(undefined);
      const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

      if (!editor) {
        return null;
      }

      useEffect(() => {
        const collaborationState: RealTimeCollaborationState = {
          status,
          synced,
          lastActive: lastSaveTime,
          readOnly: isReadOnly,
          users:
            editor.storage.collaborationCursor?.users.map(user => ({
              id: user.clientId, // TODO:MEMO This needs to be the userId, not the clientId
              profile: {
                displayName: user.name,
              },
              color: user.color,
            })) ?? [],
        };
        if (!isEqual(currentCollaborationState, collaborationState)) {
          setCollaborationState(collaborationState);
          onChangeCollaborationState?.(collaborationState);
        }
      }, [
        status,
        synced,
        lastSaveTime,
        isReadOnly,
        editor.storage.collaborationCursor?.users.length,
        editor.storage.collaborationCursor?.users,
      ]);

      return (
        <Box ref={containerRef} width="100%" onFocus={handleFocus} onBlur={handleBlur} height={height}>
          <MarkdownInputControls
            ref={toolbarRef}
            editor={editor}
            visible={areControlsVisible()}
            hideImageOptions={hideImageOptions}
            onDialogOpen={handleDialogOpen}
            onDialogClose={handleDialogClose}
            temporaryLocation={temporaryLocation}
          />
          <Box width="100%" height="calc(100% - 40px)" sx={{ overflowY: 'auto', '.ProseMirror': proseMirrorStyles }}>
            <Box position="relative" height="100%" style={{ minHeight: prevEditorHeight }}>
              <EditorContent style={{ height: '100%' }} editor={editor} />
            </Box>
          </Box>
        </Box>
      );
    }
  )
);

export default CollaborativeMarkdownInput;
