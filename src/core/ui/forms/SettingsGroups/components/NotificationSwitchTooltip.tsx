import { Box, Tooltip } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { ReactNode } from 'react';

interface NotificationSwitchTooltipProps {
  children: ReactNode;
  message?: string;
  show?: boolean;
}

export const NotificationSwitchTooltip = ({ children, message, show = false }: NotificationSwitchTooltipProps) => {
  if (!show || !message) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {children}
      <Tooltip title={message} arrow placement="top">
        <InfoOutlined
          color="primary"
          sx={{
            ml: 0.5,
            fontSize: 16,
            cursor: 'help',
            position: 'absolute',
            right: '-20px',
          }}
        />
      </Tooltip>
    </Box>
  );
};
