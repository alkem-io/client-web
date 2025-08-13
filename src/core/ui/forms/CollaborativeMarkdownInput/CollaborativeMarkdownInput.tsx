import React, { memo, useEffect, useRef, useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { EditorContent, useEditor, Editor } from '@tiptap/react';
import { InputBaseComponentProps } from '@mui/material/InputBase/InputBase';
import MarkdownInputControls from '../MarkdownInputControls/MarkdownInputControls';
import { gutters } from '@/core/ui/grid/utils';
import { isEqual } from 'lodash';
import { RealTimeCollaborationState } from '@/domain/collaboration/realTimeCollaboration/RealTimeCollaborationState';
import './styles.scss';
import { useEditorConfig } from '../MarkdownInput/hooks/useEditorConfig';
import { useImageUpload } from '../MarkdownInput/hooks/useImageUpload';
import { useMarkdownInputUI } from '../MarkdownInput/hooks/useMarkdownInputUI';
import { useCollaboration } from './hooks/useCollaboration';

interface MarkdownInputProps extends InputBaseComponentProps {
  controlsVisible?: 'always' | 'focused';
  maxLength?: number;
  inputMinHeight?: string; // defines the height of the input area
  hideImageOptions?: boolean;
  temporaryLocation?: boolean;
  collaborationId?: string;
  onChangeCollaborationState?: (state: RealTimeCollaborationState) => void;
  disabled?: boolean;
  storageBucketId?: string;
}

export const CollaborativeMarkdownInput = memo<MarkdownInputProps>(
  ({
    controlsVisible = 'focused',
    hideImageOptions,
    inputMinHeight = 'calc(100vh - 300px)',
    onFocus,
    onBlur,
    temporaryLocation,
    collaborationId,
    onChangeCollaborationState,
    disabled,
    storageBucketId = '',
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<Editor | null>(null);

    const proseMirrorStyles = useMemo(
      () => ({
        outline: 'none',
        minHeight: inputMinHeight,
        padding: gutters(0.5),
        '& p:first-of-type': { marginTop: 0 },
        '& p:last-child': { marginBottom: 0 },
        '& img': { maxWidth: '100%' },
      }),
      [inputMinHeight]
    );

    const { areControlsVisible, handleFocus, handleBlur, handleDialogOpen, handleDialogClose, prevEditorHeight } =
      useMarkdownInputUI({
        controlsVisible,
        disabled,
        toolbarRef,
        containerRef,
        onFocus,
        onBlur,
      });

    const { status, synced, lastSaveTime, isReadOnly, collaborationExtensions } = useCollaboration({
      collaborationId,
    });

    const { handlePaste } = useImageUpload({
      storageBucketId,
      hideImageOptions,
      temporaryLocation,
      getEditor: () => editorRef.current,
    });

    const editorConfig = useEditorConfig({
      handlePaste,
      disabled: disabled || isReadOnly,
      additionalExtensions: collaborationExtensions,
    });

    const editor = useEditor(
      {
        ...editorConfig,
        enableContentCheck: true,
        onContentError: ({ disableCollaboration }) => {
          disableCollaboration();
        },
      },
      [editorConfig]
    );

    // Update ref when editor changes
    useEffect(() => {
      editorRef.current = editor;
    }, [editor]);

    const [currentCollaborationState, setCollaborationState] = useState<RealTimeCollaborationState>();

    useEffect(() => {
      if (!editor) return;

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
      editor?.storage.collaborationCursor?.users.length,
      editor?.storage.collaborationCursor?.users,
      currentCollaborationState,
      onChangeCollaborationState,
    ]);

    if (!editor) {
      return null;
    }

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
        <Box width="100%" sx={{ overflowY: 'auto', '.ProseMirror': proseMirrorStyles }}>
          <Box position="relative" height="100%" style={{ minHeight: prevEditorHeight }} sx={{ cursor: 'text' }}>
            <EditorContent style={{ height: '100%' }} editor={editor} />
          </Box>
        </Box>
      </Box>
    );
  }
);

export default CollaborativeMarkdownInput;
