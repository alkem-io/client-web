import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import { Divider, ListItemIcon, Tooltip, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AddCircleOutline, DeleteOutlined, EditOutlined, ToggleOn } from '@mui/icons-material';
import PageContentBlockContextualMenu from '@/core/ui/content/PageContentBlockContextualMenu';

type InnovationFlowStateMenuProps = {
  stateId: string;
  isCurrentState: boolean;
  onUpdateCurrentState?: (stateId: string) => void;
  onEdit: (stateId: string) => void;
  onDelete: (stateId: string) => void;
  onAddStateAfter: (stateBeforeId: string) => void;
  disableStateNumberChange?: boolean;
};

export default function InnovationFlowStateMenu({
  stateId,
  isCurrentState,
  onUpdateCurrentState,
  onEdit,
  onDelete,
  onAddStateAfter,
  disableStateNumberChange = false,
}: InnovationFlowStateMenuProps) {
  const { t } = useTranslation();

  return (
    <PageContentBlockContextualMenu>
      {({ closeMenu }) => {
        const createMenuAction = (menuAction: (stateId: string) => void) => () => {
          menuAction(stateId);
          closeMenu();
        };

        return (
          <Box>
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
            {!disableStateNumberChange && (
              <>
                <Tooltip
                  title={t('components.innovationFlowSettings.stateEditor.deleteDialog.activeStateWarning')}
                  disableHoverListener={!isCurrentState}
                >
                  <span>
                    <MenuItem onClick={createMenuAction(onDelete)} disabled={isCurrentState}>
                      <ListItemIcon>
                        <DeleteOutlined fontSize="small" />
                      </ListItemIcon>
                      {t('components.innovationFlowSettings.stateEditor.deleteState')}
                    </MenuItem>
                  </span>
                </Tooltip>
                <Divider />
                <MenuItem onClick={createMenuAction(onAddStateAfter)}>
                  <ListItemIcon>
                    <AddCircleOutline fontSize="small" />
                  </ListItemIcon>
                  {t('components.innovationFlowSettings.stateEditor.addState')}
                </MenuItem>
              </>
            )}
          </Box>
        );
      }}
    </PageContentBlockContextualMenu>
  );
}
