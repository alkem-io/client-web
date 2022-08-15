import { Box, Breadcrumbs, Link, styled, Typography } from '@mui/material';
import React, { FC } from 'react';
import { RouterLink } from '../../../../components/core/RouterLink';
import { useBreadcrumbs } from '../../../../hooks';

const Root = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  padding: theme.spacing(1),
  textAlign: 'left',
}));

interface BreadcrumbsViewProps {
  title?: string;
}

const BreadcrumbsView: FC<BreadcrumbsViewProps> = ({ title }) => {
  const { loading, breadcrumbs } = useBreadcrumbs();
  return (
    <>
      {!loading && breadcrumbs.length > 0 && (
        <Root>
          {title ? <Typography variant={'button'}>{title}</Typography> : ''}
          <Breadcrumbs>
            {breadcrumbs.map((item, i) => {
              return (
                <Link key={i} component={RouterLink} to={item.url!}>
                  <Typography variant={'button'}>{item.name}</Typography>
                </Link>
              );
            })}
          </Breadcrumbs>
        </Root>
      )}
    </>
  );
};

export default BreadcrumbsView;
