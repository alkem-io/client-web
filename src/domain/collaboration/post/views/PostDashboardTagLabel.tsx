import clsx from 'clsx';
import React, { FC } from 'react';
import { Box, styled, SxProps, Theme } from '@mui/material';
import WrapperTypography from '@core/ui/typography/deprecated/WrapperTypography';
import { gutters } from '@core/ui/grid/utils';

const PREFIX = 'TagLabel';

const classes = {
  entityTypeWrapper: `${PREFIX}-entityTypeWrapper`,
  entityType: `${PREFIX}-entityType`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.entityTypeWrapper}`]: {
    background: theme.palette.augmentColor({ color: theme.palette.positive }).dark,
    boxShadow: '0px 3px 6px #00000029',
    borderRadius: '15px 0px 0px 15px',
    paddingLeft: gutters(1)(theme),
    paddingRight: gutters(1)(theme),
    marginRight: gutters(-1)(theme),
    flexShrink: 0,
  },
  [`& .${classes.entityType}`]: {
    color: theme.palette.neutralLight.main,
    textTransform: 'uppercase',
  },
}));

export interface TagLabelProps {
  className?: string;
  sx?: SxProps<Theme>;
}

const PostDashboardTagLabel: FC<TagLabelProps> = ({ children, className, sx }) => {
  return (
    <Root sx={sx}>
      <Box className={clsx(classes.entityTypeWrapper, className)}>
        <WrapperTypography variant="caption" className={classes.entityType}>
          {children}
        </WrapperTypography>
      </Box>
    </Root>
  );
};

export default PostDashboardTagLabel;
