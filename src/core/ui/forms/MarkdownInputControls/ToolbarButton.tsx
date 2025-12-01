import { Editor } from '@tiptap/react';
import React, { useEffect, useState } from 'react';
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

const ToolbarButton = ({
  component: IconButton = MarkdownInputToolbarButton,
  editor,
  command,
  specs,
  disabled,
  ...buttonProps
}: ToolbarButtonProps) => {
  const isActiveArgs = specs && ((typeof specs === 'string' ? [specs] : specs) as Parameters<Editor['isActive']>);

  const getActiveState = () => (isActiveArgs && editor ? editor.isActive(...isActiveArgs) : false);

  const getDisabledState = () => {
    if (disabled) return true;
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
      setState(produceButtonState());
      return refreshOnEditorUpdate(editor);
    }
  }, [editor, disabled]);

  return (
    <IconButton
      onClick={() => editor && command(editor.chain().focus()).run()}
      disabled={state.disabled}
      color={state.active ? 'secondary' : undefined}
      sx={{ width: gutters(2), height: gutters(2) }}
      {...buttonProps}
    />
  );
};

ToolbarButton.displayName = 'ToolbarButton';

export default ToolbarButton;
