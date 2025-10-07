import { useState } from 'react';
import { Menu } from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';
import ButtonWithTooltip from '@/core/ui/button/ButtonWithTooltip';
import { DialogActionButton } from './DialogActionButton';
import { SubspaceDialog } from './SubspaceDialog';
import { useTranslation } from 'react-i18next';

interface SubmenuActionButtonProps {
  dialogs: SubspaceDialog[];
  icon?: React.ReactNode;
  tooltip?: string;
}

export const SubmenuActionButton = ({ dialogs, icon = <MoreHoriz />, tooltip }: SubmenuActionButtonProps) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <ButtonWithTooltip
        variant="contained"
        tooltip={tooltip || t('common.more')}
        tooltipPlacement="bottom"
        iconButton
        onClick={handleClick}
      >
        {icon}
      </ButtonWithTooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {dialogs.map(dialog => (
          <DialogActionButton key={dialog} dialog={dialog} actionDisplay="menuItem" onClick={handleClose} />
        ))}
      </Menu>
    </>
  );
};
