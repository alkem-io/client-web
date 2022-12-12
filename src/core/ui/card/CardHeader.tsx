import React from 'react';
import { Box } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import { BlockTitle, Caption } from '../typography';
import { gutters } from '../grid/utils';
import RoundedIcon from '../icon/RoundedIcon';

interface CardTitleSectionProps {
  title?: string;
  iconComponent?: SvgIconComponent;
  createdBy?: string;
}

const CardHeader = ({ iconComponent, title = '', createdBy = '' }: CardTitleSectionProps) => {
  return (
    <Box display="flex" alignItems="center" height={gutters(3)} paddingX={1} gap={1}>
      {iconComponent && <RoundedIcon flexShrink={0} marginLeft={0.5} size="small" component={iconComponent} />}
      <Box flex={1} flexBasis={0} paddingX={0.5} overflow="hidden">
        <BlockTitle noWrap>{title}</BlockTitle>
        <Caption noWrap>{createdBy}</Caption>
      </Box>
    </Box>
  );
};

export default CardHeader;
