import { Box, styled } from '@mui/material';
import React, { FC, Fragment } from 'react';
import { Path } from '../../context/NavigationProvider';
import { Breadcrumbs as MUIBreadcrumbs, Link } from '@mui/material';
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
        {paths.map((p, i) => (
          <Fragment key={i}>
            {p.real && (
              <Link component={RouterLink} to={p.value}>
                {p.name.toUpperCase()}
              </Link>
            )}
            {!p.real && <Box component="span">{p.name.toUpperCase()}</Box>}
          </Fragment>
        ))}
      </MUIBreadcrumbs>
    </Root>
  );
};

export default Breadcrumbs;
