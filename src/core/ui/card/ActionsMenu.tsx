import React, { cloneElement, isValidElement, useCallback, useState } from 'react';
import { ClickAwayListener, IconButton, Menu } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';

interface ActionsMenuProps {
  children: React.ReactNode;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({ children }) => {
  const { t } = useTranslation();
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const settingsOpened = Boolean(settingsAnchorEl);

  // prevent the redirection of Link components when clicking on the ActionsMenu
  const onMenuClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setSettingsAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setSettingsAnchorEl(null);
  }, []);

  // close the menu on every item click
  const clonedChildren = React.Children.map(children, child => {
    if (isValidElement(child)) {
      return cloneElement(child as React.ReactElement, {
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          if (child.props.onClick) {
            child.props.onClick(event);
          }
          handleClose();
        },
      });
    }

    return child;
  });

  return (
    <div onClick={e => e.stopPropagation()}>
      <IconButton
        aria-label={t('common.settings')}
        aria-haspopup="true"
        aria-controls={settingsOpened ? 'settings-menu' : undefined}
        aria-expanded={settingsOpened ? 'true' : undefined}
        onClick={onMenuClick}
      >
        <MoreVertIcon color="primary" />
      </IconButton>
      <ClickAwayListener onClickAway={handleClose}>
        <Menu
          aria-labelledby="settings-button"
          anchorEl={settingsAnchorEl}
          open={settingsOpened}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {clonedChildren}
        </Menu>
      </ClickAwayListener>
    </div>
  );
};

export default ActionsMenu;
