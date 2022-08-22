import { Box, Breadcrumbs, styled, Typography } from '@mui/material';
import React, { FC } from 'react';
import { RouterLink } from '../../../../components/core/RouterLink';
import { useBreadcrumbs } from '../../../../hooks';

const Root = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  textAlign: 'left',
  zIndex: 20,
  maxWidth: '50%',
  '& .MuiBreadcrumbs-separator': {
    display: 'none !important',
  },
  '& ol.MuiBreadcrumbs-ol': {
    display: 'block',
  },
  '& nav': {
    lineHeight: 1,
  },
  '& .MuiBreadcrumbs-ol li': {
    display: 'block',
    marginTop: theme.spacing(1),
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('lg')]: {
      marginTop: theme.spacing(0.2),
    },
  },
}));

// Tags:
const Breadcrumb = styled(RouterLink)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  backgroundColor: theme.palette.primary.main,
  borderTopRightRadius: theme.spacing(5),
  borderBottomRightRadius: theme.spacing(5),
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(2),
  display: 'inline-block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textDecoration: 'none',
  maxWidth: '100%',
  // Icon
  '& .MuiSvgIcon-root': {
    width: '0.7em',
    marginRight: theme.spacing(1),
    verticalAlign: 'middle',
    position: 'relative',
    top: -1,
  },
}));

interface BreadcrumbsViewProps {}

const BreadcrumbsView: FC<BreadcrumbsViewProps> = () => {
  const { loading, breadcrumbs } = useBreadcrumbs();
  return (
    <>
      {!loading && breadcrumbs.length > 0 && (
        <Root>
          <Breadcrumbs>
            {breadcrumbs.map((item, i) => {
              const Icon = item.icon;
              return (
                <Breadcrumb key={i} to={item.url!}>
                  <Icon />
                  <Typography variant={'button'}>{item.title}</Typography>
                </Breadcrumb>
              );
            })}
          </Breadcrumbs>
        </Root>
      )}
    </>
  );
};

export default BreadcrumbsView;
