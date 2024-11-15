import { CloseOutlined, DeleteOutlined, MoreVertOutlined } from '@mui/icons-material';
import { IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { Caption } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';

interface ChatWidgetMenuProps {
  onClear: () => void;
  onClose: () => void;
}

const ChatWidgetMenu = ({ onClear, onClose }: ChatWidgetMenuProps) => {
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClear = useCallback(() => {
    onClear();
    setAnchorEl(null);
  }, [onClear]);

  const handleClose = useCallback(() => {
    onClose();
    setAnchorEl(null);
  }, [onClose]);

  return (
    <>
      <IconButton
        onClick={event => setAnchorEl(event.currentTarget)}
        sx={{
          borderRadius: theme => `${theme.shape.borderRadius}px`,
          width: gutters(1.5),
          marginLeft: gutters(-0.2),
          marginRight: gutters(-0.4),
          color: theme => theme.palette.muted.main,
        }}
      >
        <MoreVertOutlined color="inherit" />
      </IconButton>
      <Menu open={anchorEl !== null} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handleClear}>
          <ListItemIcon>
            <DeleteOutlined fontSize="small" />
          </ListItemIcon>
          <Caption textTransform="none">{t('chatbot.menu.clear')}</Caption>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <CloseOutlined fontSize="small" />
          </ListItemIcon>
          <Caption textTransform="none">{t('chatbot.menu.close')}</Caption>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ChatWidgetMenu;
