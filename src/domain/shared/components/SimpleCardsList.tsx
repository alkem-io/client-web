import React, { PropsWithChildren } from 'react';
import { Box, styled } from '@mui/material';

const SimpleCardsList = ({ children }: PropsWithChildren<{}>) => {
  const Root = styled(Box)(({ theme }) => ({
    paddingBottom: theme.spacing(2),
  }));

  return (
    <Root display="flex" flexWrap="wrap" columnGap={8} rowGap={3} justifyContent="start">
      {children}
    </Root>
  );
};

export default SimpleCardsList;
