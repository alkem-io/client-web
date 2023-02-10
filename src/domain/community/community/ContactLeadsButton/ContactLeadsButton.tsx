import React, { FC } from 'react';
import { Button, IconButtonProps, Tooltip } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

interface ContactLeadsButtonProps {
  tooltip?: string;
  sx?: IconButtonProps['sx'];
  onClick: () => void;
}

const ContactLeadsButton: FC<ContactLeadsButtonProps> = ({ children, tooltip = '', sx, onClick }) => {
  return (
    <Tooltip title={tooltip} arrow placement="top">
      <Button variant="contained" color="primary" onClick={() => onClick()} sx={{ width: '100%', ...sx }}>
        <EmailOutlinedIcon sx={{ marginRight: theme => theme.spacing(2) }} />
        {children}
      </Button>
    </Tooltip>
  );
};

export default ContactLeadsButton;
