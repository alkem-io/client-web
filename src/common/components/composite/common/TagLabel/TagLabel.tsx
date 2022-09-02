import clsx from 'clsx';
import React, { FC } from 'react';
import { Box, styled, SxProps, Theme } from '@mui/material';
import Typography from '../../../core/Typography';

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
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
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

const TagLabel: FC<TagLabelProps> = ({ children, className, sx }) => {
  return (
    <Root sx={sx}>
      <Box className={clsx(classes.entityTypeWrapper, className)}>
        <Typography variant="caption" className={classes.entityType}>
          {children}
        </Typography>
      </Box>
    </Root>
  );
};
export default TagLabel;
