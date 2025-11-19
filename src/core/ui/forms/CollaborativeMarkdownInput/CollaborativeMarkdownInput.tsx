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
  fullScreen?: boolean;
  autoFocus?: boolean;
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
    fullScreen = false,
    autoFocus = false,
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

    const { status, synced, lastSaveTime, isReadOnly, readOnlyCode, collaborationExtensions } = useCollaboration({
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

    // Auto-focus editor when autoFocus is true and editor is ready
    useEffect(() => {
      if (autoFocus && editor && !disabled && synced) {
        // Small delay to ensure the editor is fully rendered
        const timeout = setTimeout(() => {
          editor.commands.focus();
        }, 100);
        return () => clearTimeout(timeout);
      }
    }, [autoFocus, editor, disabled, synced]);

    const [currentCollaborationState, setCollaborationState] = useState<RealTimeCollaborationState>();

    useEffect(() => {
      if (!editor) return;

      const collaborationState: RealTimeCollaborationState = {
        status,
        synced,
        lastActive: lastSaveTime,
        readOnly: isReadOnly,
        readOnlyCode: readOnlyCode,
        users:
          editor.storage.collaborationCaret?.users.map(user => ({
            id: user.id,
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
      readOnlyCode,
      editor?.storage.collaborationCaret?.users.length,
      editor?.storage.collaborationCaret?.users,
      currentCollaborationState,
      onChangeCollaborationState,
    ]);

    if (!editor) {
      return null;
    }

    return (
      <Box
        ref={containerRef}
        width="100%"
        onFocus={handleFocus}
        onBlur={handleBlur}
        sx={{
          height: fullScreen ? '100%' : inputMinHeight,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            borderBottom: '1px solid #efefef',
          }}
        >
          <MarkdownInputControls
            ref={toolbarRef}
            editor={editor}
            visible={areControlsVisible()}
            hideImageOptions={hideImageOptions}
            onDialogOpen={handleDialogOpen}
            onDialogClose={handleDialogClose}
            temporaryLocation={temporaryLocation}
          />
        </Box>
        <Box
          width="100%"
          sx={{
            flex: 1,
            overflowY: 'auto',
            '.ProseMirror': {
              ...proseMirrorStyles,
              minHeight: 'auto',
            },
          }}
        >
          <Box position="relative" height="100%" style={{ minHeight: prevEditorHeight }} sx={{ cursor: 'text' }}>
            <EditorContent style={{ height: '100%' }} editor={editor} />
          </Box>
        </Box>
      </Box>
    );
  }
);

export default CollaborativeMarkdownInput;
