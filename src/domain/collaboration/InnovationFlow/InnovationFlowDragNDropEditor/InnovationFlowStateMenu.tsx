import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import { Divider, ListItemIcon, Tooltip, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AddCircleOutline, StickyNote2Outlined, DeleteOutlined, EditOutlined, ToggleOn } from '@mui/icons-material';
import PageContentBlockContextualMenu from '@/core/ui/content/PageContentBlockContextualMenu';

type InnovationFlowStateMenuProps = {
  stateId: string;
  isCurrentState: boolean;
  onUpdateCurrentState?: (stateId: string) => void;
  onEdit: (stateId: string) => void;
  onDelete: (stateId: string) => void;
  onAddStateAfter: (stateBeforeId: string) => void;
  onSetDefaultTemplate: (stateId: string) => void;
  disableStateNumberChange?: boolean;
  disableAddStateAfter?: boolean;
  disableRemoveState?: boolean;
};

export default function InnovationFlowStateMenu({
  stateId,
  isCurrentState,
  onUpdateCurrentState,
  onEdit,
  onDelete,
  onAddStateAfter,
  onSetDefaultTemplate,
  disableStateNumberChange = false,
  disableAddStateAfter = false,
  disableRemoveState = false,
}: Readonly<InnovationFlowStateMenuProps>) {
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
            <MenuItem onClick={createMenuAction(onSetDefaultTemplate)}>
              <ListItemIcon>
                <StickyNote2Outlined fontSize="small" />
              </ListItemIcon>
              {t('components.innovationFlowSettings.stateEditor.setDefaultTemplate')}
            </MenuItem>
            {!disableStateNumberChange && (
              <>
                <Tooltip
                  title={t('components.innovationFlowSettings.stateEditor.deleteDialog.activeStateWarning')}
                  disableHoverListener={!isCurrentState}
                >
                  <span>
                    <MenuItem onClick={createMenuAction(onDelete)} disabled={isCurrentState || disableRemoveState}>
                      <ListItemIcon>
                        <DeleteOutlined fontSize="small" />
                      </ListItemIcon>
                      {t('components.innovationFlowSettings.stateEditor.deleteState')}
                    </MenuItem>
                  </span>
                </Tooltip>
                <Divider />
                <MenuItem onClick={createMenuAction(onAddStateAfter)} disabled={disableAddStateAfter}>
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
