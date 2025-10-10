import { useState, useRef } from 'react';
import { Menu } from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';
import ButtonWithTooltip from '@/core/ui/button/ButtonWithTooltip';
import { DialogActionButton } from './DialogActionButton';
import { SubspaceDialog } from './SubspaceDialog';
import { useTranslation } from 'react-i18next';
import SwapColors from '@/core/ui/palette/SwapColors';
import { gutters } from '@/core/ui/grid/utils';

interface SubmenuActionButtonProps {
  dialogs: SubspaceDialog[];
  icon?: React.ReactNode;
  tooltip?: string;
}

export const SubmenuActionButton = ({ dialogs, icon = <MoreHoriz />, tooltip }: SubmenuActionButtonProps) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    // Return focus to the button that opened the menu
    setTimeout(() => {
      buttonRef.current?.focus();
    }, 0);
  };

  return (
    <>
      <ButtonWithTooltip
        ref={buttonRef}
        variant="contained"
        tooltip={tooltip || t('common.more')}
        tooltipPlacement="bottom"
        iconButton
        onClick={handleClick}
        aria-controls={open ? 'submenu-actions' : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {icon}
      </ButtonWithTooltip>
      <SwapColors>
        <Menu
          id="submenu-actions"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          autoFocus
          disableAutoFocusItem={false}
          variant="menu"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          slotProps={{
            paper: {
              sx: {
                marginTop: gutters(0.2),
              },
            },
            list: {
              'aria-labelledby': 'submenu-actions',
              autoFocusItem: true,
              autoFocus: true,
              // Ensure MenuList has proper tabIndex for keyboard navigation
              tabIndex: 0,
              onKeyDown: event => {
                // Prevent default link navigation on arrow keys
                if (
                  event.key === 'ArrowDown' ||
                  event.key === 'ArrowUp' ||
                  event.key === 'Home' ||
                  event.key === 'End'
                ) {
                  event.stopPropagation();
                  event.preventDefault();
                }
              },
            },
          }}
        >
          {dialogs.map(dialog => (
            <DialogActionButton key={dialog} dialog={dialog} actionDisplay="menuItem" onClick={handleClose} />
          ))}
        </Menu>
      </SwapColors>
    </>
  );
};
