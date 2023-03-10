import { Editor } from '@tiptap/react';
import React, { useEffect, useState } from 'react';
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
import { Box, Collapse, IconButton, IconButtonProps } from '@mui/material';
import { gutters } from '../../grid/utils';
import { ChainedCommands } from '@tiptap/core/dist/packages/core/src/types';
import InsertImageButton from './InsertImageButton';
import ToggleLinkButton from './ToggleLinkButton';
import InsertEmojiButton from './InsertEmojiButton';

interface MarkdownInputControlsProps {
  editor: Editor | null;
  focused?: boolean;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
}

interface ControlsButtonProps extends IconButtonProps {
  editor: Editor | null;
  command: (commandsChain: ChainedCommands) => ChainedCommands;
  specs?: string | [attributes: {}] | [nodeOrMark: string, attributes?: {}];
}

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

const MarkdownInputControls = ({
  editor,
  focused = false,
  onDialogOpen,
  onDialogClose,
}: MarkdownInputControlsProps) => {
  const [isVisible, setIsVisible] = useState(focused);

  useEffect(() => {
    if (focused) {
      setTimeout(() => {
        setIsVisible(() => focused);
      }, CONTROLS_SHOW_DELAY_MS);
    } else {
      setIsVisible(false);
    }
  }, [focused]);

  return (
    <Collapse in={isVisible}>
      <Box display="flex" flexWrap="wrap" gap={gutters(0.5)} marginBottom={gutters(0.5)}>
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
        <ControlsButton editor={editor} command={e => e.toggleHeading({ level: 1 })} specs={['heading', { level: 1 }]}>
          <Title fontSize="large" />
        </ControlsButton>
        <ControlsButton editor={editor} command={e => e.toggleHeading({ level: 2 })} specs={['heading', { level: 2 }]}>
          <Title />
        </ControlsButton>
        <ControlsButton editor={editor} command={e => e.toggleHeading({ level: 3 })} specs={['heading', { level: 3 }]}>
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
      </Box>
    </Collapse>
  );
};

export default MarkdownInputControls;
