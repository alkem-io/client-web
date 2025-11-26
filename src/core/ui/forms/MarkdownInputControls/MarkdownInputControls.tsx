import { Editor } from '@tiptap/react';
import { Ref } from 'react';
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
import { Collapse, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';
import InsertImageButton from './InsertImageButton';
import ToggleLinkButton from './ToggleLinkButton';
import InsertEmojiButton from './InsertEmojiButton';
import { InsertEmbedCodeButton } from './InsertEmbedCodeButton/InsertEmbedCodeButton';
import { useTranslation } from 'react-i18next';
import ToolbarButton from './ToolbarButton';
import TableControls from './Tables/TableControls';
import { useTableState } from './Tables/useTableState';

type MarkdownInputControlsProps = {
  editor: Editor | null;
  visible?: boolean;
  hideImageOptions?: boolean;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
  temporaryLocation?: boolean;
};

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

const MarkdownInputControls = ({
  ref,
  editor,
  visible = false,
  hideImageOptions = false,
  onDialogOpen,
  onDialogClose,
  temporaryLocation = false,
}: MarkdownInputControlsProps & { ref: Ref<HTMLDivElement> }) => {
  const { t } = useTranslation();
  const isEditingTable = useTableState(editor);

  return (
    <Collapse in={visible} ref={ref}>
      <Toolbar value={false} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
        <ToolbarButton
          editor={editor}
          command={e => e.undo()}
          tooltip={t('components.wysiwyg-editor.toolbar.history.undo')}
        >
          <Undo />
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          command={e => e.redo()}
          tooltip={t('components.wysiwyg-editor.toolbar.history.redo')}
        >
          <Redo />
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          command={e => e.toggleBold()}
          specs="bold"
          tooltip={t('components.wysiwyg-editor.toolbar.inline.bold')}
        >
          <FormatBold />
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          command={e => e.toggleItalic()}
          specs="italic"
          tooltip={t('components.wysiwyg-editor.toolbar.inline.italic')}
        >
          <FormatItalic />
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          command={e => e.toggleHeading({ level: 1 })}
          specs={['heading', { level: 1 }]}
          tooltip={t('components.wysiwyg-editor.toolbar.blocktype.h1')}
        >
          <Title fontSize="large" />
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          command={e => e.toggleHeading({ level: 2 })}
          specs={['heading', { level: 2 }]}
          tooltip={t('components.wysiwyg-editor.toolbar.blocktype.h2')}
        >
          <Title />
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          command={e => e.toggleHeading({ level: 3 })}
          specs={['heading', { level: 3 }]}
          tooltip={t('components.wysiwyg-editor.toolbar.blocktype.h3')}
        >
          <Title fontSize="small" />
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          command={e => e.toggleBulletList()}
          specs="bulletList"
          disabled={isEditingTable}
          tooltip={t('components.wysiwyg-editor.toolbar.list.unordered')}
        >
          <FormatListBulleted />
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          command={e => e.toggleOrderedList()}
          specs="orderedList"
          disabled={isEditingTable}
          tooltip={t('components.wysiwyg-editor.toolbar.list.ordered')}
        >
          <FormatListNumbered />
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          command={e => e.toggleBlockquote()}
          specs="blockquote"
          disabled={isEditingTable}
          tooltip={t('components.wysiwyg-editor.toolbar.blocktype.blockquote')}
        >
          <FormatQuoteOutlined />
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          command={e => e.toggleCodeBlock()}
          specs="codeBlock"
          disabled={isEditingTable}
          tooltip={t('components.wysiwyg-editor.toolbar.blocktype.code')}
        >
          <Code />
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          command={e => e.setHorizontalRule()}
          disabled={isEditingTable}
          tooltip={t('components.wysiwyg-editor.toolbar.horizontal.line')}
        >
          <HorizontalRuleOutlined />
        </ToolbarButton>
        <TableControls editor={editor} isEditingTable={isEditingTable} />
        <ToggleLinkButton editor={editor} onDialogOpen={onDialogOpen} onDialogClose={onDialogClose} />
        {!hideImageOptions && (
          <InsertImageButton
            editor={editor}
            onDialogOpen={onDialogOpen}
            onDialogClose={onDialogClose}
            temporaryLocation={temporaryLocation}
          />
        )}
        {!hideImageOptions && ( // Don't join these two, they throw a warning about MUI Tabs component not accepting React Fragments
          <InsertEmbedCodeButton editor={editor} onDialogOpen={onDialogOpen} onDialogClose={onDialogClose} />
        )}
        <InsertEmojiButton editor={editor} onDialogOpen={onDialogOpen} onDialogClose={onDialogClose} />
      </Toolbar>
    </Collapse>
  );
};

MarkdownInputControls.displayName = 'MarkdownInputControls';

export default MarkdownInputControls;
