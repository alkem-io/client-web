import React, { memo, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { Box, useTheme } from '@mui/material';
import { InputBaseComponentProps } from '@mui/material/InputBase/InputBase';
import { CharacterCountContainer } from './CharacterCountContext';
import MarkdownInputControls from '../MarkdownInputControls/MarkdownInputControls';
import { gutters } from '@/core/ui/grid/utils';
import { EditorContent, Editor } from '@tiptap/react';
import { useStorageConfigContext } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useEditorConfig } from './hooks/useEditorConfig';
import { useImageUpload } from './hooks/useImageUpload';
import { useMarkdownInputUI } from './hooks/useMarkdownInputUI';
import { useMarkdownEditor } from './hooks/useMarkdownEditor';
import { MarkdownInputStyles } from './hooks/MarkdownInputStyles';

export interface MarkdownInputProps extends InputBaseComponentProps {
  controlsVisible?: 'always' | 'focused';
  maxLength?: number;
  hideImageOptions?: boolean;
  temporaryLocation?: boolean;
  // In React 19, ref becomes a regular prop
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

export const MarkdownInput = memo<MarkdownInputProps>(
  ({
    ref,
    value,
    onChange,
    maxLength,
    controlsVisible = 'focused',
    hideImageOptions,
    onFocus,
    onBlur,
    temporaryLocation = false,
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const editorRef = useRef<Editor | null>(null);

    const storageConfig = useStorageConfigContext();
    const storageBucketId = storageConfig?.storageBucketId;

    const {
      areControlsVisible,
      getLabelOffset,
      handleFocus,
      handleBlur,
      handleDialogOpen,
      handleDialogClose,
      prevEditorHeight,
      setPrevEditorHeight,
      isInteractingWithInput,
    } = useMarkdownInputUI({
      controlsVisible,
      disabled: false,
      toolbarRef,
      containerRef,
      onFocus,
      onBlur,
    });

    const { handlePaste } = useImageUpload({
      storageBucketId,
      hideImageOptions,
      temporaryLocation,
      getEditor: () => editorRef.current,
    });

    const editorConfig = useEditorConfig({
      handlePaste,
      disabled: false,
    });

    const { editor, shadowEditor } = useMarkdownEditor({
      value,
      onChange,
      maxLength,
      editorConfig,
      isInteractingWithInput,
    });

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

    const keepScrollPositionOnEditorReset = useCallback(
      (editorInstance: Editor) => {
        const handleCreate = () => {
          setPrevEditorHeight(0);
        };

        editorInstance.on('create', handleCreate);

        return () => {
          editorInstance.off('create', handleCreate);
        };
      },
      [setPrevEditorHeight]
    );

    useEffect(() => {
      if (editor) {
        return keepScrollPositionOnEditorReset(editor);
      }
    }, [editor, keepScrollPositionOnEditorReset]);

    const handleBlurWithScrollPosition = useCallback(
      (event: React.FocusEvent<HTMLDivElement>) => {
        if (containerRef.current?.contains(event.relatedTarget)) {
          return;
        }
        setPrevEditorHeight(editor?.view.dom.clientHeight ?? 0);
        handleBlur(event);
      },
      [containerRef, editor, setPrevEditorHeight, handleBlur]
    );

    if (!editor) {
      return null;
    }

    return (
      <Box ref={containerRef} width="100%" onFocus={handleFocus} onBlur={handleBlurWithScrollPosition}>
        {MarkdownInputStyles}
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
);

export default MarkdownInput;
