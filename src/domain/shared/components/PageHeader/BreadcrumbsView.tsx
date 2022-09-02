import { Box, Breadcrumbs, styled, Typography } from '@mui/material';
import React, { FC } from 'react';
import { RouterLink } from '../../../../common/components/core/RouterLink';
import { useBreadcrumbs } from '../../../../hooks';
import useAutomaticTooltip from '../../utils/useAutomaticTooltip';

const Root = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  textAlign: 'left',
  zIndex: 20,
  maxWidth: '45%',
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
    lineHeight: 0,
    display: 'block',
    marginTop: theme.spacing(1),
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(0.7),
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
  const { containerReference, addAutomaticTooltip } = useAutomaticTooltip();

  return (
    <>
      {!loading && breadcrumbs.length > 0 && (
        <Root ref={containerReference}>
          <Breadcrumbs>
            {breadcrumbs.map((item, i) => {
              const Icon = item.icon;
              return (
                <Breadcrumb key={i} to={item.url!}>
                  <Icon />
                  <Typography variant={'button'} ref={element => addAutomaticTooltip(element)}>
                    {item.title}
                  </Typography>
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
