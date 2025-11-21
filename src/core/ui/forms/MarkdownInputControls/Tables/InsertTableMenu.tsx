import React, { useState } from 'react';
import { Menu, MenuItem, Box, TextField, Button, Stack, ListItemIcon } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import { gutters } from '../../../grid/utils';
import { Caption } from '../../../typography';

const MAX_SIZE = 8;

interface InsertTableMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onInsert: (rows: number, cols: number) => void;
}

const GridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${MAX_SIZE}, 1fr)`,
  gap: '2px',
  padding: gutters(1)(theme),
  paddingBottom: gutters(0.5)(theme),
}));

const Cell = styled(Box, {
  shouldForwardProp: prop => prop !== 'highlighted',
})<{ highlighted: boolean }>(({ theme, highlighted }) => ({
  width: gutters()(theme),
  height: gutters()(theme),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: highlighted ? theme.palette.primary.light : theme.palette.background.paper,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
}));

const InsertTableMenu = ({ anchorEl, open, onClose, onInsert }: InsertTableMenuProps) => {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState({ rows: 0, cols: 0 });
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customRows, setCustomRows] = useState(MAX_SIZE);
  const [customCols, setCustomCols] = useState(MAX_SIZE);

  const handleMouseEnter = (rows: number, cols: number) => {
    setHovered({ rows, cols });
  };

  const handleClick = (rows: number, cols: number) => {
    onInsert(rows, cols);
    onClose();
  };

  const handleCustomSubmit = () => {
    onInsert(customRows, customCols);
    onClose();
    setIsCustomMode(false);
  };

  const handleCustomCancel = () => {
    setIsCustomMode(false);
  };

  const isValid = customRows > 0 && customCols > 0;

  const renderGrid = () => {
    const cells: React.ReactNode[] = [];
    for (let r = 1; r <= MAX_SIZE; r++) {
      for (let c = 1; c <= MAX_SIZE; c++) {
        const isHighlighted = r <= hovered.rows && c <= hovered.cols;
        cells.push(
          <Cell
            key={`${r}-${c}`}
            highlighted={isHighlighted}
            onMouseEnter={() => handleMouseEnter(r, c)}
            onClick={() => handleClick(r, c)}
          />
        );
      }
    }
    return cells;
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={() => {
        onClose();
        setIsCustomMode(false);
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      {!isCustomMode
        ? [
            <Box key="grid">
              <GridContainer onMouseLeave={() => setHovered({ rows: 0, cols: 0 })}>{renderGrid()}</GridContainer>
              <Caption textAlign="center" marginBottom={gutters(0.5)}>
                {hovered.cols > 0
                  ? t('components.wysiwyg-editor.toolbar.table.gridSize', { columns: hovered.cols, rows: hovered.rows })
                  : t('components.wysiwyg-editor.toolbar.table.insert')}
              </Caption>
            </Box>,
            <MenuItem key="custom" onClick={() => setIsCustomMode(true)} sx={{ paddingX: gutters() }}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              {t('components.wysiwyg-editor.toolbar.table.custom')}
            </MenuItem>,
          ]
        : [
            <Box key="customForm" padding={gutters(1)}>
              <Stack direction="row" alignItems="center" spacing={1} marginBottom={2}>
                <TextField
                  label={t('components.wysiwyg-editor.toolbar.table.columns')}
                  type="number"
                  value={customCols}
                  onChange={e => setCustomCols(parseInt(e.target.value) || 0)}
                  size="small"
                  sx={{ width: gutters(4) }}
                  error={customCols <= 0}
                />
                <Caption>x</Caption>
                <TextField
                  label={t('components.wysiwyg-editor.toolbar.table.rows')}
                  type="number"
                  value={customRows}
                  onChange={e => setCustomRows(parseInt(e.target.value) || 0)}
                  size="small"
                  sx={{ width: gutters(4) }}
                  error={customRows <= 0}
                />
              </Stack>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={handleCustomCancel}>{t('buttons.cancel')}</Button>
                <Button onClick={handleCustomSubmit} variant="contained" disabled={!isValid}>
                  {t('buttons.ok')}
                </Button>
              </Stack>
            </Box>,
          ]}
    </Menu>
  );
};

export default InsertTableMenu;
