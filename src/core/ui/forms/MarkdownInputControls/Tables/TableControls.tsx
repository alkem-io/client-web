import { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';
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
import { gutters } from '@/core/ui/grid/utils';
import MarkdownInputToolbarButton from '../MarkdownInputToolbarButton';
import { useTranslation } from 'react-i18next';
import InsertTableMenu from './InsertTableMenu';
import TableOperationsIcon from './TableOperationsIcon';
import ToolbarMenuItem from '../ToolbarMenuItem';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';

const useTableState = (editor: Editor | null) => {
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    if (!editor) return;
    const update = () => setIsActive(editor.isActive('table'));
    editor.on('transaction', update);
    editor.on('selectionUpdate', update);
    update();
    return () => {
      editor.off('transaction', update);
      editor.off('selectionUpdate', update);
    };
  }, [editor]);
  return isActive;
};

interface TableControlsProps {
  editor: Editor | null;
}

const TableControls = ({ editor }: TableControlsProps) => {
  const { t } = useTranslation();
  const isTableActive = useTableState(editor);
  const [tableMenuAnchorEl, setTableMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [insertMenuAnchorEl, setInsertMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isDeleteTableDialogOpen, setIsDeleteTableDialogOpen] = useState(false);

  const handleTableMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setTableMenuAnchorEl(event.currentTarget);
  };

  const handleTableMenuClose = () => {
    setTableMenuAnchorEl(null);
  };

  const handleInsertMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setInsertMenuAnchorEl(event.currentTarget);
  };

  const handleInsertMenuClose = () => {
    setInsertMenuAnchorEl(null);
  };

  const handleInsertTable = (rows: number, cols: number) => {
    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
  };

  const openDeleteTableDialog = () => {
    handleTableMenuClose();
    setIsDeleteTableDialogOpen(true);
  };

  const handleDeleteTable = () => {
    editor?.chain().focus().deleteTable().run();
    setIsDeleteTableDialogOpen(false);
  };

  return (
    <>
      <MarkdownInputToolbarButton
        onClick={handleInsertMenuOpen}
        tooltip={t('components.wysiwyg-editor.toolbar.table.insert')}
        disabled={!editor?.can().insertTable()}
        hidden={isTableActive}
        sx={{ width: gutters(2), height: gutters(2) }}
      >
        <TableChartOutlined />
      </MarkdownInputToolbarButton>
      <InsertTableMenu
        anchorEl={insertMenuAnchorEl}
        open={Boolean(insertMenuAnchorEl)}
        onClose={handleInsertMenuClose}
        onInsert={handleInsertTable}
      />
      <MarkdownInputToolbarButton
        onClick={handleTableMenuOpen}
        tooltip={t('components.wysiwyg-editor.toolbar.table.operations')}
        sx={{ width: gutters(2), height: gutters(2) }}
        hidden={!isTableActive}
      >
        <TableOperationsIcon />
      </MarkdownInputToolbarButton>
      <Menu anchorEl={tableMenuAnchorEl} open={Boolean(tableMenuAnchorEl)} onClose={handleTableMenuClose}>
        <MenuItem onClick={openDeleteTableDialog} disabled={!editor?.can().deleteTable()}>
          <ListItemIcon>
            <DeleteForever fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.deleteTable')}</ListItemText>
        </MenuItem>
        <ToolbarMenuItem editor={editor} command={e => e.addColumnBefore()} onClick={handleTableMenuClose}>
          <ListItemIcon>
            <BorderLeft fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.addColumnBefore')}</ListItemText>
        </ToolbarMenuItem>
        <ToolbarMenuItem editor={editor} command={e => e.addColumnAfter()} onClick={handleTableMenuClose}>
          <ListItemIcon>
            <BorderRight fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.addColumnAfter')}</ListItemText>
        </ToolbarMenuItem>
        <ToolbarMenuItem editor={editor} command={e => e.deleteColumn()} onClick={handleTableMenuClose}>
          <ListItemIcon>
            <DeleteSweep fontSize="small" sx={{ transform: 'rotate(90deg)' }} />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.deleteColumn')}</ListItemText>
        </ToolbarMenuItem>
        <ToolbarMenuItem editor={editor} command={e => e.addRowBefore()} onClick={handleTableMenuClose}>
          <ListItemIcon>
            <BorderTop fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.addRowBefore')}</ListItemText>
        </ToolbarMenuItem>
        <ToolbarMenuItem editor={editor} command={e => e.addRowAfter()} onClick={handleTableMenuClose}>
          <ListItemIcon>
            <BorderBottom fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.addRowAfter')}</ListItemText>
        </ToolbarMenuItem>
        <ToolbarMenuItem editor={editor} command={e => e.deleteRow()} onClick={handleTableMenuClose}>
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
