import { memo, useState, useEffect, forwardRef, useCallback } from 'react';

import produce from 'immer';
import {
  Code,
  Undo,
  Redo,
  Title,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuoteOutlined,
  HorizontalRuleOutlined,
} from '@mui/icons-material';
import { Editor } from '@tiptap/react';
import { styled } from '@mui/material/styles';
import { Collapse, IconButton, IconButtonProps, Tabs } from '@mui/material';

import ToggleLinkButton from './ToggleLinkButton';
import InsertEmojiButton from './InsertEmojiButton';
import InsertImageButton from './InsertImageButton';

import { gutters } from '../../grid/utils';
import { ChainedCommands } from '@tiptap/core/dist/packages/core/src/types';

/*
Tabs component used without real Tabs, because MUI Tabs component has a very useful variant="scrollable"
that adds buttons on the sides of the toolbar when the buttons don't fit in a single row */
const Toolbar = styled(Tabs)(() => ({
  /* Hide scroll buttons when they are disabled. Material puts opacity: 0 and toolbar looks ugly. Better hidden */
  '.MuiTabScrollButton-root.Mui-disabled': {
    display: 'none',
  },
  minHeight: 'auto',
}));

const ControlsButton = memo(
  ({ editor, command, specs, ...buttonProps }: ControlsButtonProps) => {
    const isActiveArgs = specs && ((typeof specs === 'string' ? [specs] : specs) as Parameters<Editor['isActive']>);

    const getActiveState = () => (isActiveArgs ? editor?.isActive(...isActiveArgs) : false);

    const getDisabledState = () => !editor || !command(editor.can().chain().focus()).run();

    const produceButtonState = (prevState: ButtonState = {}) =>
      produce(prevState, nextState => {
        nextState.active = getActiveState();
        nextState.disabled = getDisabledState();
      });

    const [state, setState] = useState<ButtonState>(produceButtonState());

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
        return refreshOnEditorUpdate(editor);
      }
    }, [editor]);

    return (
      <IconButton
        disabled={state.disabled}
        color={state.active ? 'secondary' : undefined}
        sx={{ width: gutters(2), height: gutters(2) }}
        onClick={useCallback(() => editor && command(editor.chain().focus()).run(), [editor, command])}
        {...buttonProps}
      />
    );
  },
  (prevProps, nextProps) => {
    return prevProps.editor === nextProps.editor;
  }
);

const CONTROLS_SHOW_DELAY_MS = 150; // Allows a user to select text by double-click without "jumping".

const MarkdownInputControls = memo(
  forwardRef<HTMLDivElement | null, MarkdownInputControlsProps>(
    (
      { editor, visible = false, hideImageOptions = false, temporaryLocation = false, onDialogOpen, onDialogClose },
      ref
    ) => {
      const [isVisible, setIsVisible] = useState(visible);

      useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (visible) {
          timeoutId = setTimeout(() => {
            setIsVisible(() => visible);
          }, CONTROLS_SHOW_DELAY_MS);
        } else {
          setIsVisible(false);
        }

        return () => clearTimeout(timeoutId);
      }, [visible]);

      return (
        <Collapse ref={ref} in={isVisible}>
          <Toolbar value={false} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
            <ControlsButton editor={editor} command={e => e.undo()}>
              <Undo />
            </ControlsButton>

            <ControlsButton editor={editor} command={e => e.redo()}>
              <Redo />
            </ControlsButton>

            <ControlsButton editor={editor} command={e => e.toggleBold()} specs="bold">
              <FormatBold />
            </ControlsButton>

            <ControlsButton editor={editor} command={e => e.toggleItalic()} specs="italic">
              <FormatItalic />
            </ControlsButton>

            <ControlsButton
              editor={editor}
              specs={['heading', { level: 1 }]}
              command={e => e.toggleHeading({ level: 1 })}
            >
              <Title fontSize="large" />
            </ControlsButton>

            <ControlsButton
              editor={editor}
              specs={['heading', { level: 2 }]}
              command={e => e.toggleHeading({ level: 2 })}
            >
              <Title />
            </ControlsButton>

            <ControlsButton
              editor={editor}
              specs={['heading', { level: 3 }]}
              command={e => e.toggleHeading({ level: 3 })}
            >
              <Title fontSize="small" />
            </ControlsButton>

            <ControlsButton editor={editor} command={e => e.toggleBulletList()} specs="bulletList">
              <FormatListBulleted />
            </ControlsButton>

            <ControlsButton editor={editor} command={e => e.toggleOrderedList()} specs="orderedList">
              <FormatListNumbered />
            </ControlsButton>

            <ControlsButton editor={editor} command={e => e.toggleBlockquote()} specs="blockquote">
              <FormatQuoteOutlined />
            </ControlsButton>

            <ControlsButton editor={editor} command={e => e.toggleCodeBlock()} specs="codeBlock">
              <Code />
            </ControlsButton>

            <ControlsButton editor={editor} command={e => e.setHorizontalRule()}>
              <HorizontalRuleOutlined />
            </ControlsButton>

            <ToggleLinkButton editor={editor} onDialogOpen={onDialogOpen} onDialogClose={onDialogClose} />

            {!hideImageOptions && (
              <InsertImageButton
                editor={editor}
                temporaryLocation={temporaryLocation}
                onDialogOpen={onDialogOpen}
                onDialogClose={onDialogClose}
              />
            )}

            <InsertEmojiButton editor={editor} onDialogOpen={onDialogOpen} onDialogClose={onDialogClose} />
          </Toolbar>
        </Collapse>
      );
    }
  )
);

export default MarkdownInputControls;

interface ButtonState {
  active?: boolean;
  disabled?: boolean;
}

type MarkdownInputControlsProps = {
  visible?: boolean;
  editor: Editor | null;
  hideImageOptions?: boolean;
  temporaryLocation?: boolean;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
};

interface ControlsButtonProps extends IconButtonProps {
  editor: Editor | null;
  command: (commandsChain: ChainedCommands) => ChainedCommands;
  specs?: string | [attributes: {}] | [nodeOrMark: string, attributes?: {}];
}
