import { Box, BoxProps, Breadcrumbs, styled, Typography, useTheme } from '@mui/material';
import React, { FC } from 'react';
import { RouterLink } from '../../../../core/ui/link/deprecated/RouterLink';
import { useBreadcrumbs } from '../../../journey/common/journeyBreadcrumbs/useBreadcrumbs';
import useAutomaticTooltip from '../../utils/useAutomaticTooltip';
import getEntityColor from '../../utils/getEntityColor';

const Root = styled(Box)(({ theme }) => ({
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

interface BreadcrumbsViewProps extends BoxProps {}

const BreadcrumbsView: FC<BreadcrumbsViewProps> = props => {
  const { loading, breadcrumbs } = useBreadcrumbs();
  const { containerReference, addAutomaticTooltip } = useAutomaticTooltip();

  const theme = useTheme();

  return (
    <>
      {!loading && breadcrumbs.length > 0 && (
        <Root ref={containerReference} {...props}>
          <Breadcrumbs>
            {breadcrumbs.map(item => {
              const Icon = item.icon;

              const breadcrumbBackgroundColor = getEntityColor(theme, item.entity);
              // const breadcrumbForegroundColor = theme.palette.common.white;

              return (
                <Breadcrumb
                  key={item.entity}
                  to={item.url!}
                  sx={{
                    [theme.breakpoints.down('lg')]: {
                      backgroundColor: breadcrumbBackgroundColor,
                      // color: breadcrumbForegroundColor,
                    },
                  }}
                >
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
