import { Box, Breadcrumbs as MUIBreadcrumbs, Link, styled } from '@mui/material';
import React, { FC } from 'react';
import { Path } from '../../context/NavigationProvider';
import { RouterLink } from './RouterLink';

const Root = styled('div')(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  fontWeight: 'bold',
}));

interface BreadcrumbProps {
  paths: Path[];
}

const Breadcrumbs: FC<BreadcrumbProps> = ({ paths }) => {
  return (
    <Root>
      <MUIBreadcrumbs>
        {paths.map((p, i) => {
          return p.real ? (
            <Link key={i} component={RouterLink} to={p.value}>
              {p.name.toUpperCase()}
            </Link>
          ) : (
            <Box key={i} component="span">
              {p.name.toUpperCase()}
            </Box>
          );
        })}
      </MUIBreadcrumbs>
    </Root>
  );
};

export default Breadcrumbs;
