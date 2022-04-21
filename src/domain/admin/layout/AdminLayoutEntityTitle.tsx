import React, { FC } from 'react';
import { Box } from '@mui/material';
import { EntityLinkComponent, EntityLinkComponentProps } from '../../../components/Admin/EntityLinkComponent';

const AdminLayoutEntityTitle: FC<EntityLinkComponentProps> = props => {
  return (
    <Box paddingY={1}>
      <EntityLinkComponent {...props} />
    </Box>
  );
};

export default AdminLayoutEntityTitle;
