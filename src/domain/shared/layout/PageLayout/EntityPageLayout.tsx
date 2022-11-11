import React, { PropsWithChildren } from 'react';
import { EntityPageLayoutProps } from './EntityPageLayoutTypes';
import EntityPageLayoutDesktop from './EntityPageLayoutDesktop';
import { useMediaQuery, useTheme } from '@mui/material';
import EntityPageLayoutMobile from './EntityPageLayoutMobile';

const EntityPageLayout = (props: PropsWithChildren<EntityPageLayoutProps>) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const Layout = isMobile ? EntityPageLayoutMobile : EntityPageLayoutDesktop;

  return (
    <Layout {...props} />
  );
};

export default EntityPageLayout;
