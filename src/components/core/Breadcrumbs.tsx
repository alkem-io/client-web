import { Box, Breadcrumbs as MUIBreadcrumbs, Link, styled, Typography } from '@mui/material';
import React, { FC } from 'react';
import { Path } from '../../context/NavigationProvider';
import { RouterLink } from './RouterLink';

const Root = styled('div')(({ theme }) => ({
  padding: `${theme.spacing(2)} 0`,
}));

interface BreadcrumbProps {
  paths: Path[];
}

const Breadcrumbs: FC<BreadcrumbProps> = ({ paths }) => {
  return (
    <Root>
      <MUIBreadcrumbs>
        {paths.map((p, i) => {
          return p.real && i !== paths.length - 1 ? (
            <Link key={i} component={RouterLink} to={p.value!}>
              <Typography variant="caption" fontWeight="600">
                {p.name.toUpperCase()}
              </Typography>
            </Link>
          ) : (
            <Box key={i} component="span">
              <Typography variant="caption" color="neutralMedium.main" fontWeight="600">
                {p.name.toUpperCase()}
              </Typography>
            </Box>
          );
        })}
      </MUIBreadcrumbs>
    </Root>
  );
};

export default Breadcrumbs;
