import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ClickAwayListener, IconButton, Menu } from '@mui/material';
import { Children, MouseEvent, PropsWithChildren, cloneElement, isValidElement, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ClickableProps = {
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const ActionsMenu = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation();
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const settingsOpened = Boolean(settingsAnchorEl);

  // prevent the redirection of Link components when clicking on the ActionsMenu
  const onMenuClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setSettingsAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setSettingsAnchorEl(null);
  }, [setSettingsAnchorEl]);

  // close the menu on every item click
  const clonedChildren = Children.map(children, child => {
    if (isValidElement<ClickableProps>(child)) {
      return cloneElement(child, {
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          child.props.onClick?.(event);
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
