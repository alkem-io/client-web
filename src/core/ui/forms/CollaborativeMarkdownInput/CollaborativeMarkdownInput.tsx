import React, { memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Box, BoxProps } from '@mui/material';
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
  height?: BoxProps['height']; // Make optional
  hideImageOptions?: boolean;
  temporaryLocation?: boolean;
  collaborationId?: string;
  onChangeCollaborationState?: (state: RealTimeCollaborationState) => void;
  disabled?: boolean;
  storageBucketId?: string; // Make optional with fallback
  ref?: React.Ref<MarkdownInputRefApi>;
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

const proseMirrorStyles = {
  outline: 'none',
  minHeight: gutters(4),
  padding: gutters(0.5),
  '& p:first-of-type': { marginTop: 0 },
  '& p:last-child': { marginBottom: 0 },
  '& img': { maxWidth: '100%' },
} as const;

export const CollaborativeMarkdownInput = memo<MarkdownInputProps>(
  ({
    controlsVisible = 'focused',
    hideImageOptions,
    height = '200px', // Default height
    onFocus,
    onBlur,
    temporaryLocation,
    collaborationId,
    onChangeCollaborationState,
    disabled,
    storageBucketId = '', // Default to empty string
    ref,
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<Editor | null>(null);

    const {
      areControlsVisible,
      getLabelOffset,
      handleFocus,
      handleBlur,
      handleDialogOpen,
      handleDialogClose,
      prevEditorHeight,
    } = useMarkdownInputUI({
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

    useImperativeHandle(
      ref,
      () => ({
        getLabelOffset,
        focus: () => editor?.commands.focus(),
        get value() {
          return editor?.getText();
        },
      }),
      [editor, getLabelOffset]
    );

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
);

export default CollaborativeMarkdownInput;
