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
import { Menu, ListItemIcon, ListItemText } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import MarkdownInputToolbarButton from '../MarkdownInputToolbarButton';
import { useTranslation } from 'react-i18next';
import InsertTableMenu from './InsertTableMenu';
import TableOperationsIcon from './TableOperationsIcon';
import ToolbarMenuItem from '../ToolbarMenuItem';

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

  if (!isTableActive) {
    return (
      <>
        <MarkdownInputToolbarButton
          onClick={handleInsertMenuOpen}
          tooltip={t('components.wysiwyg-editor.toolbar.table.insert')}
          disabled={!editor?.can().insertTable()}
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
      </>
    );
  }

  return (
    <>
      <MarkdownInputToolbarButton
        onClick={handleTableMenuOpen}
        tooltip={t('components.wysiwyg-editor.toolbar.table.operations')}
        sx={{ width: gutters(2), height: gutters(2) }}
      >
        <TableOperationsIcon />
      </MarkdownInputToolbarButton>
      <Menu anchorEl={tableMenuAnchorEl} open={Boolean(tableMenuAnchorEl)} onClose={handleTableMenuClose}>
        <ToolbarMenuItem
          editor={editor}
          command={e => e.deleteTable()}
          tooltip={t('components.wysiwyg-editor.toolbar.table.deleteTable')}
          onClick={handleTableMenuClose}
        >
          <ListItemIcon>
            <DeleteForever fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.deleteTable')}</ListItemText>
        </ToolbarMenuItem>
        <ToolbarMenuItem
          editor={editor}
          command={e => e.addColumnBefore()}
          tooltip={t('components.wysiwyg-editor.toolbar.table.addColumnBefore')}
          onClick={handleTableMenuClose}
        >
          <ListItemIcon>
            <BorderLeft fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.addColumnBefore')}</ListItemText>
        </ToolbarMenuItem>
        <ToolbarMenuItem
          editor={editor}
          command={e => e.addColumnAfter()}
          tooltip={t('components.wysiwyg-editor.toolbar.table.addColumnAfter')}
          onClick={handleTableMenuClose}
        >
          <ListItemIcon>
            <BorderRight fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.addColumnAfter')}</ListItemText>
        </ToolbarMenuItem>
        <ToolbarMenuItem
          editor={editor}
          command={e => e.deleteColumn()}
          tooltip={t('components.wysiwyg-editor.toolbar.table.deleteColumn')}
          onClick={handleTableMenuClose}
        >
          <ListItemIcon>
            <DeleteSweep fontSize="small" sx={{ transform: 'rotate(90deg)' }} />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.deleteColumn')}</ListItemText>
        </ToolbarMenuItem>
        <ToolbarMenuItem
          editor={editor}
          command={e => e.addRowBefore()}
          tooltip={t('components.wysiwyg-editor.toolbar.table.addRowBefore')}
          onClick={handleTableMenuClose}
        >
          <ListItemIcon>
            <BorderTop fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.addRowBefore')}</ListItemText>
        </ToolbarMenuItem>
        <ToolbarMenuItem
          editor={editor}
          command={e => e.addRowAfter()}
          tooltip={t('components.wysiwyg-editor.toolbar.table.addRowAfter')}
          onClick={handleTableMenuClose}
        >
          <ListItemIcon>
            <BorderBottom fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.addRowAfter')}</ListItemText>
        </ToolbarMenuItem>
        <ToolbarMenuItem
          editor={editor}
          command={e => e.deleteRow()}
          tooltip={t('components.wysiwyg-editor.toolbar.table.deleteRow')}
          onClick={handleTableMenuClose}
        >
          <ListItemIcon>
            <DeleteSweep fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('components.wysiwyg-editor.toolbar.table.deleteRow')}</ListItemText>
        </ToolbarMenuItem>
      </Menu>
    </>
  );
};

export default TableControls;
