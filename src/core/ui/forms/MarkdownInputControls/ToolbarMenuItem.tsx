import { MenuItem } from '@mui/material';
import { ChainedCommands } from '@tiptap/core';
import { Editor } from '@tiptap/react';
import { produce } from 'immer';
import React, { memo, useEffect, useState } from 'react';

interface ToolbarMenuItemProps {
  editor: Editor | null;
  command: (commandsChain: ChainedCommands) => ChainedCommands;
  specs?: string | [attributes: {}] | [nodeOrMark: string, attributes?: {}];
  onClick?: () => void;
  children: React.ReactNode;
}

interface ButtonState {
  active?: boolean;
  disabled?: boolean;
}

const ToolbarMenuItem = memo(
  ({ editor, command, specs, onClick, children, ...menuItemProps }: ToolbarMenuItemProps) => {
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
      const handleStateChange = async () => {
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
    }, [editor]);

    return (
      <MenuItem
        onClick={() => {
          editor && command(editor.chain().focus()).run();
          onClick && onClick();
        }}
        disabled={state.disabled}
        selected={state.active}
        {...menuItemProps}
      >
        {children}
      </MenuItem>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.editor === nextProps.editor;
  }
);
ToolbarMenuItem.displayName = 'ToolbarMenuItem';

export default ToolbarMenuItem;
