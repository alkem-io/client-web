import React, { FC } from 'react';
import { useTheme } from '@mui/material';

const UpdatesContainer: FC = ({ children }) => {
  const theme = useTheme();

  return (
    <div
      style={{
        alignItems: 'center',
        background: theme.palette.primary.main,
        fontFamily: theme.typography.fontFamily,
        color: 'white',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};

export default UpdatesContainer;
