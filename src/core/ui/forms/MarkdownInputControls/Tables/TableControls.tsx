import { ChainedCommands, Editor } from '@tiptap/react';
import React, { useState } from 'react';
import {
  TableChartOutlined,
  DeleteForever,
  BorderLeft,
  BorderRight,
  BorderTop,
  BorderBottom,
  DeleteSweep,
} from '@mui/icons-material';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MarkdownInputToolbarButton from '../MarkdownInputToolbarButton';
import { useTranslation } from 'react-i18next';
import InsertTableMenu from './InsertTableMenu';
import TableOperationsIcon from './TableOperationsIcon';
import ToolbarMenuItem from '../ToolbarMenuItem';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';

interface TableControlsProps {
  editor: Editor | null;
  isEditingTable: boolean;
}

const TableControls = ({ editor, isEditingTable }: TableControlsProps) => {
  const { t } = useTranslation();
  const [insertTableMenuAnchorEl, setInsertTableMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [tableOperationsMenuAnchorEl, setTableOperationsMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isDeleteTableDialogOpen, setIsDeleteTableDialogOpen] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<null | { from: number; to: number }>(null);
  const [canDeleteTable, setCanDeleteTable] = useState(false);

  const updateCurrentSelection = () => {
    if (editor?.state.selection) {
      setCurrentSelection({ from: editor.state.selection.from, to: editor.state.selection.to });
    } else {
      setCurrentSelection(null);
    }
  };
  const restoreUserSelection = (e: ChainedCommands) => {
    if (currentSelection && editor) {
      return e.focus().setTextSelection({ from: currentSelection.from, to: currentSelection.to });
    }
    return e;
  };

  const handleTableMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    updateCurrentSelection();
    setCanDeleteTable(editor?.can().deleteTable() ?? false);
    setTableOperationsMenuAnchorEl(event.currentTarget);
  };

  const handleTableMenuClose = () => {
    setCurrentSelection(null);
    setTableOperationsMenuAnchorEl(null);
  };

  const handleInsertMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    updateCurrentSelection();
    setInsertTableMenuAnchorEl(event.currentTarget);
  };

  const handleInsertMenuClose = () => {
    setCurrentSelection(null);
    setInsertTableMenuAnchorEl(null);
  };

  const handleInsertTable = (rows: number, cols: number) => {
    if (!editor) return;
    restoreUserSelection(editor.chain()).insertTable({ rows, cols, withHeaderRow: true }).run();
  };

  const openDeleteTableDialog = () => {
    handleTableMenuClose();
    setIsDeleteTableDialogOpen(true);
  };

  const handleDeleteTable = () => {
    if (!editor) return;
    restoreUserSelection(editor.chain()).deleteTable().run();
    setIsDeleteTableDialogOpen(false);
  };

  return (
    <>
      <MarkdownInputToolbarButton
        onClick={handleInsertMenuOpen}
        tooltip={t('components.wysiwyg-editor.toolbar.table.insert')}
        disabled={!editor?.can().insertTable()}
        hidden={isEditingTable}
      >
        <TableChartOutlined />
      </MarkdownInputToolbarButton>
      <InsertTableMenu
        anchorEl={insertTableMenuAnchorEl}
        open={Boolean(insertTableMenuAnchorEl)}
        onClose={handleInsertMenuClose}
        onInsert={handleInsertTable}
      />
      <MarkdownInputToolbarButton
        onClick={handleTableMenuOpen}
        tooltip={t('components.wysiwyg-editor.toolbar.table.operations')}
        hidden={!isEditingTable}
      >
        <TableOperationsIcon />
      </MarkdownInputToolbarButton>
      <Menu
        anchorEl={tableOperationsMenuAnchorEl}
        open={Boolean(tableOperationsMenuAnchorEl)}
        onClose={handleTableMenuClose}
      >
        <MenuItem onClick={openDeleteTableDialog} disabled={!canDeleteTable}>
          <ListItemIcon>
            <DeleteForever fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.deleteTable')}</ListItemText>
        </MenuItem>
        <ToolbarMenuItem
          editor={editor}
          command={e => restoreUserSelection(e).addColumnBefore()}
          onClick={handleTableMenuClose}
        >
          <ListItemIcon>
            <BorderLeft fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.addColumnBefore')}</ListItemText>
        </ToolbarMenuItem>
        <ToolbarMenuItem
          editor={editor}
          command={e => restoreUserSelection(e).addColumnAfter()}
          onClick={handleTableMenuClose}
        >
          <ListItemIcon>
            <BorderRight fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.addColumnAfter')}</ListItemText>
        </ToolbarMenuItem>
        <ToolbarMenuItem
          editor={editor}
          command={e => restoreUserSelection(e).deleteColumn()}
          onClick={handleTableMenuClose}
        >
          <ListItemIcon>
            <DeleteSweep fontSize="small" sx={{ transform: 'rotate(90deg)' }} />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.deleteColumn')}</ListItemText>
        </ToolbarMenuItem>
        <ToolbarMenuItem
          editor={editor}
          command={e => restoreUserSelection(e).addRowBefore()}
          onClick={handleTableMenuClose}
        >
          <ListItemIcon>
            <BorderTop fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.addRowBefore')}</ListItemText>
        </ToolbarMenuItem>
        <ToolbarMenuItem
          editor={editor}
          command={e => restoreUserSelection(e).addRowAfter()}
          onClick={handleTableMenuClose}
        >
          <ListItemIcon>
            <BorderBottom fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.addRowAfter')}</ListItemText>
        </ToolbarMenuItem>
        <ToolbarMenuItem
          editor={editor}
          command={e => restoreUserSelection(e).deleteRow()}
          onClick={handleTableMenuClose}
        >
          <ListItemIcon>
            <DeleteSweep fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.deleteRow')}</ListItemText>
        </ToolbarMenuItem>
      </Menu>
      <ConfirmationDialog
        entities={{
          title: t('components.wysiwyg-editor.toolbar.table.deleteTable'),
          content: t('components.wysiwyg-editor.toolbar.table.deleteConfirm'),
          confirmButtonText: t('buttons.yesDelete'),
        }}
        actions={{
          onCancel: () => setIsDeleteTableDialogOpen(false),
          onConfirm: handleDeleteTable,
        }}
        options={{
          show: isDeleteTableDialogOpen,
        }}
      />
    </>
  );
};

export default TableControls;
