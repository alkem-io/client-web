import { Editor } from '@tiptap/react';
import React, { forwardRef, useEffect, useState } from 'react';
import {
  Code,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuoteOutlined,
  HorizontalRuleOutlined,
  Redo,
  Title,
  Undo,
} from '@mui/icons-material';
import { Collapse, IconButton, IconButtonProps, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';
import { gutters } from '../../grid/utils';
import { ChainedCommands } from '@tiptap/core/dist/packages/core/src/types';
import InsertImageButton from './InsertImageButton';
import ToggleLinkButton from './ToggleLinkButton';
import InsertEmojiButton from './InsertEmojiButton';

interface MarkdownInputControlsProps {
  editor: Editor | null;
  visible?: boolean;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
}

interface ControlsButtonProps extends IconButtonProps {
  editor: Editor | null;
  command: (commandsChain: ChainedCommands) => ChainedCommands;
  specs?: string | [attributes: {}] | [nodeOrMark: string, attributes?: {}];
}

/*
Tabs component used without real Tabs, because MUI Tabs component has a very useful variant="scrollable"
that adds buttons on the sides of the toolbar when the buttons don't fit in a single row */
const Toolbar = styled(Tabs)(() => ({
  /* Hide scroller buttons when they are disabled. Material puts opacity: 0 and toolbar looks ugly. Better hidden */
  '.MuiTabScrollButton-root.Mui-disabled': {
    display: 'none',
  },
  minHeight: 'auto',
}));

const ControlsButton = ({ editor, command, specs, ...buttonProps }: ControlsButtonProps) => {
  const isActiveArgs = specs && ((typeof specs === 'string' ? [specs] : specs) as Parameters<Editor['isActive']>);

  const isActive = isActiveArgs && editor?.isActive(...isActiveArgs);

  return (
    <IconButton
      onClick={() => editor && command(editor.chain().focus()).run()}
      disabled={!editor || !command(editor.can().chain().focus()).run()}
      color={isActive ? 'secondary' : undefined}
      sx={{ width: gutters(2), height: gutters(2) }}
      {...buttonProps}
    />
  );
};

const CONTROLS_SHOW_DELAY_MS = 150; // to allow a user to select text by double-click without "jumping"

const MarkdownInputControls = forwardRef<HTMLDivElement | null, MarkdownInputControlsProps>(
  ({ editor, visible = false, onDialogOpen, onDialogClose }, ref) => {
    const [isVisible, setIsVisible] = useState(visible);

    useEffect(() => {
      if (visible) {
        setTimeout(() => {
          setIsVisible(() => visible);
        }, CONTROLS_SHOW_DELAY_MS);
      } else {
        setIsVisible(false);
      }
    }, [visible]);

    return (
      <Collapse in={isVisible} ref={ref}>
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
            command={e => e.toggleHeading({ level: 1 })}
            specs={['heading', { level: 1 }]}
          >
            <Title fontSize="large" />
          </ControlsButton>
          <ControlsButton
            editor={editor}
            command={e => e.toggleHeading({ level: 2 })}
            specs={['heading', { level: 2 }]}
          >
            <Title />
          </ControlsButton>
          <ControlsButton
            editor={editor}
            command={e => e.toggleHeading({ level: 3 })}
            specs={['heading', { level: 3 }]}
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
          <InsertImageButton editor={editor} onDialogOpen={onDialogOpen} onDialogClose={onDialogClose} />
          <InsertEmojiButton editor={editor} onDialogOpen={onDialogOpen} onDialogClose={onDialogClose} />
        </Toolbar>
      </Collapse>
    );
  }
);

export default MarkdownInputControls;
