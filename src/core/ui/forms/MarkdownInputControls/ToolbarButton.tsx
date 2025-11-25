import { Editor } from '@tiptap/react';
import React, { memo, useEffect, useState } from 'react';
import { produce } from 'immer';
import MarkdownInputToolbarButton, { MarkdownInputToolbarButtonProps } from './MarkdownInputToolbarButton';
import { ChainedCommands } from '@tiptap/core';
import { gutters } from '@/core/ui/grid/utils';

export interface ToolbarButtonProps extends MarkdownInputToolbarButtonProps {
  component?: React.ComponentType<MarkdownInputToolbarButtonProps>;
  editor: Editor | null;
  command: (commandsChain: ChainedCommands) => ChainedCommands;
  specs?: string | [attributes: {}] | [nodeOrMark: string, attributes?: {}];
}

interface ButtonState {
  active?: boolean;
  disabled?: boolean;
}

const ToolbarButton = memo(
  ({
    component: IconButton = MarkdownInputToolbarButton,
    editor,
    command,
    specs,
    ...buttonProps
  }: ToolbarButtonProps) => {
    const isActiveArgs = specs && ((typeof specs === 'string' ? [specs] : specs) as Parameters<Editor['isActive']>);

    const getActiveState = () => (isActiveArgs && editor ? editor.isActive(...isActiveArgs) : false);

    const getDisabledState = () => {
      if (!editor || !editor.view) return true;
      try {
        return !command(editor.can().chain().focus()).run();
      } catch {
        return true;
      }
    };

    const produceButtonState = (prevState: ButtonState = {}) =>
      produce(prevState, nextState => {
        nextState.active = getActiveState();
        nextState.disabled = getDisabledState();
      });

    const [state, setState] = useState<ButtonState>({ disabled: true, active: false });

    const refreshOnEditorUpdate = (editor: Editor) => {
      const handleStateChange = () => {
        setState(produceButtonState);
      };

      editor.on('transaction', handleStateChange);

      return () => {
        editor.off('transaction', handleStateChange);
      };
    };

    useEffect(() => {
      if (editor) {
        return refreshOnEditorUpdate(editor);
      }
    }, [editor]);

    return (
      <IconButton
        onClick={() => editor && command(editor.chain().focus()).run()}
        disabled={state.disabled}
        color={state.active ? 'secondary' : undefined}
        sx={{ width: gutters(2), height: gutters(2) }}
        {...buttonProps}
      />
    );
  },
  (prevProps, nextProps) => {
    return prevProps.editor === nextProps.editor;
  }
);

ToolbarButton.displayName = 'ToolbarButton';

export default ToolbarButton;
