import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { Button, type IconButtonProps, Tooltip } from '@mui/material';
import type { PropsWithChildren } from 'react';

type ContactLeadsButtonProps = {
  tooltip?: string;
  sx?: IconButtonProps['sx'];
  onClick: () => void;
};

const ContactLeadsButton = ({ children, tooltip = '', sx, onClick }: PropsWithChildren<ContactLeadsButtonProps>) => (
  <Tooltip title={tooltip} arrow={true} placement="top">
    <Button variant="contained" color="primary" onClick={() => onClick()} sx={{ width: '100%', ...sx }}>
      <EmailOutlinedIcon sx={{ marginRight: theme => theme.spacing(2) }} />
      {children}
    </Button>
  </Tooltip>
);

export default ContactLeadsButton;
