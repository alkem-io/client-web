import React, { ComponentType } from 'react';
import { Box, styled, SvgIconProps } from '@mui/material';
import Icon from '../../../shared/components/Icon';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';

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

const CardTitleSection = ({ iconComponent, title = '', createdBy = '' }: CardTitleSectionProps) => {
  return (
    <Box width={230} display="flex" alignItems="center" height={gutters(3)} paddingX={1} gap={1}>
      {iconComponent && (
        <RoundedIcon>
          <Icon iconComponent={iconComponent} size="small" />
        </RoundedIcon>
      )}
      <Box flex={1} paddingX={0.5}>
        <BlockTitle>{title}</BlockTitle>
        <Caption>{createdBy}</Caption>
      </Box>
    </Box>
  );
};

export default CardTitleSection;
