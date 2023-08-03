import React, { FC, ReactElement } from 'react';
import { Box, Typography } from '@mui/material';

interface ContactDetailProps {
  title: string;
  icon?: ReactElement;
  value?: string;
}

export const ContactDetail: FC<ContactDetailProps> = ({ title, icon, value }) => {
  return (
    <>
      {value &&
        (icon ? (
          <Box title={title} sx={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <Typography>{value}</Typography>
          </Box>
        ) : (
          <Box>
            <Typography color="primary" fontWeight="bold">
              {title}
            </Typography>
            <Typography>{value}</Typography>
          </Box>
        ))}
    </>
  );
};
