import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import { Box, styled, SxProps, Theme } from '@mui/material';
import clsx from 'clsx';
import { PropsWithChildren } from 'react';

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
}));

export interface TagLabelProps {
  className?: string;
  sx?: SxProps<Theme>;
}

const PostDashboardTagLabel = ({ children, className, sx }: PropsWithChildren<TagLabelProps>) => (
  <Root sx={sx}>
    <Box className={clsx(classes.entityTypeWrapper, className)}>
      <Caption textTransform="uppercase" color="neutralLight.main" fontWeight="medium">
        {children}
      </Caption>
    </Box>
  </Root>
);

export default PostDashboardTagLabel;
