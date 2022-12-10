import React, { ComponentType } from 'react';
import { Box, styled, SvgIconProps } from '@mui/material';
import Icon from '../icon/Icon';
import { BlockTitle, Caption } from '../typography';
import { gutters } from '../grid/utils';

const RoundedIcon = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.dark,
  color: theme.palette.common.white,
  borderRadius: '50%',
  width: theme.spacing(2.5),
  height: theme.spacing(2.5),
  margin: theme.spacing(0.5),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

interface CardTitleSectionProps {
  title?: string;
  iconComponent?: ComponentType<SvgIconProps>;
  createdBy?: string;
}

const CardHeader = ({ iconComponent, title = '', createdBy = '' }: CardTitleSectionProps) => {
  return (
    <Box display="flex" alignItems="center" height={gutters(3)} paddingX={1} gap={1}>
      {iconComponent && (
        <RoundedIcon flexShrink={0}>
          <Icon iconComponent={iconComponent} size="small" />
        </RoundedIcon>
      )}
      <Box flex={1} flexBasis={0} paddingX={0.5} overflow="hidden">
        <BlockTitle noWrap>{title}</BlockTitle>
        <Caption noWrap>{createdBy}</Caption>
      </Box>
    </Box>
  );
};

export default CardHeader;
