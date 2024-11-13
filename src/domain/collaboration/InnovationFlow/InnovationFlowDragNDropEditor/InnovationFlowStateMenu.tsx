import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import { Divider, ListItemIcon } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AddCircleOutline, DeleteOutlined, EditOutlined, ToggleOn } from '@mui/icons-material';
import PageContentBlockContextualMenu from '@core/ui/content/PageContentBlockContextualMenu';

interface InnovationFlowStateMenuProps {
  state: string;
  isCurrentState: boolean;
  onUpdateCurrentState?: (state: string) => void;
  onEdit: (state: string) => void;
  onDelete: (state: string) => void;
  onAddStateAfter: (stateBefore: string) => void;
}

export default function InnovationFlowStateMenu({
  state,
  isCurrentState,
  onUpdateCurrentState,
  onEdit,
  onDelete,
  onAddStateAfter,
}: InnovationFlowStateMenuProps) {
  const { t } = useTranslation();

  return (
    <PageContentBlockContextualMenu>
      {({ closeMenu }) => {
        const createMenuAction = (menuAction: (state: string) => void) => () => {
          menuAction(state);
          closeMenu();
        };

        return (
          <>
            {isCurrentState ? (
              <MenuItem disabled>
                <ListItemIcon>
                  <ToggleOn fontSize="small" color="primary" />
                </ListItemIcon>
                {t('components.innovationFlowSettings.stateEditor.activeState')}
              </MenuItem>
            ) : (
              onUpdateCurrentState && (
                <MenuItem onClick={createMenuAction(onUpdateCurrentState)}>
                  <ListItemIcon>
                    <ToggleOn fontSize="small" />
                  </ListItemIcon>
                  {t('components.innovationFlowSettings.stateEditor.setActiveState')}
                </MenuItem>
              )
            )}
            <MenuItem onClick={createMenuAction(onEdit)}>
              <ListItemIcon>
                <EditOutlined fontSize="small" />
              </ListItemIcon>
              {t('components.innovationFlowSettings.stateEditor.editState')}
            </MenuItem>
            <MenuItem onClick={createMenuAction(onDelete)}>
              <ListItemIcon>
                <DeleteOutlined fontSize="small" />
              </ListItemIcon>
              {t('components.innovationFlowSettings.stateEditor.deleteState')}
            </MenuItem>
            <Divider />
            <MenuItem onClick={createMenuAction(onAddStateAfter)}>
              <ListItemIcon>
                <AddCircleOutline fontSize="small" />
              </ListItemIcon>
              {t('components.innovationFlowSettings.stateEditor.addState')}
            </MenuItem>
          </>
        );
      }}
    </PageContentBlockContextualMenu>
  );
}
