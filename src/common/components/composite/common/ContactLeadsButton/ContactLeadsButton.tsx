import React, { FC } from 'react';
import { Box, Button, IconButtonProps, Tooltip } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

interface ContactLeadsButtonProps {
  title?: string;
  tooltip?: string;
  sx?: IconButtonProps['sx'];
  onClick: () => void;
}

const ContactLeadsButton: FC<ContactLeadsButtonProps> = ({ title = undefined, tooltip = '', sx, onClick }) => {
  return (
    <>
      <Tooltip title={tooltip} arrow placement="top">
        <Box>
          <Button variant="contained" color="primary" onClick={() => onClick()} sx={{ width: '100%', ...sx }}>
            <EmailOutlinedIcon sx={{ marginRight: theme => theme.spacing(2) }} />
            {title}
          </Button>
        </Box>
      </Tooltip>
    </>
  );
};

export default ContactLeadsButton;
