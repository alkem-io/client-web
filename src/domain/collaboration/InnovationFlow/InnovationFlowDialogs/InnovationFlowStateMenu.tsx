import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Divider, IconButton, ListItemIcon } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AddCircleOutline, Delete, Edit, MoreVert, ToggleOn } from '@mui/icons-material';

interface InnovationFlowStateMenuProps {
  state: string;
  isCurrentState: boolean;
  onUpdateCurrentState: (state: string) => void;
  onEdit: (state: string) => void;
  onDelete: (state: string) => void;
  onAddState: (stateBefore: string) => void;
}

export default function InnovationFlowStateMenu({
  state,
  isCurrentState,
  onUpdateCurrentState,
  onEdit,
  onDelete,
  onAddState,
}: InnovationFlowStateMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { t } = useTranslation();

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        aria-haspopup="true"
        size="small"
        sx={{ padding: 0 }}
        onClick={event => setAnchorEl(event.currentTarget)}
      >
        <MoreVert fontSize="small" sx={{ padding: 0 }} />
      </IconButton>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {isCurrentState ? (
          <MenuItem disabled>
            <ListItemIcon>
              <ToggleOn fontSize="small" color="primary" />
            </ListItemIcon>
            {t('components.innovationFlowSettings.stateEditor.activeState')}
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              onUpdateCurrentState(state);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <ToggleOn fontSize="small" />
            </ListItemIcon>
            {t('components.innovationFlowSettings.stateEditor.setActiveState')}
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            onEdit(state);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          {t('components.innovationFlowSettings.stateEditor.editState')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDelete(state);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          {t('components.innovationFlowSettings.stateEditor.deleteState')}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            onAddState(state);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <AddCircleOutline fontSize="small" />
          </ListItemIcon>
          {t('components.innovationFlowSettings.stateEditor.addState')}
        </MenuItem>
      </Menu>
    </>
  );
}
