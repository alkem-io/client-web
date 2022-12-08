import React, { ComponentType } from 'react';
import { Box, styled, SvgIconProps } from '@mui/material';

import Icon from '../../../shared/components/Icon';
import { BlockTitle, Caption } from '../../../../core/ui/typography';

const RoundedIcon = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.dark,
  color: theme.palette.common.white,
  borderRadius: '50%',
  width: theme.spacing(3.5),
  height: theme.spacing(3.5),
  margin: theme.spacing(1.5, 2),
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
    <Box sx={{ display: 'flex' }}>
      {iconComponent && (
        <RoundedIcon>
          <Icon iconComponent={iconComponent} size="small" />
        </RoundedIcon>
      )}
      <Box sx={{ flex: 1, padding: theme => theme.spacing(1, 1, 1, 0) }}>
        <BlockTitle>{title}</BlockTitle>
        <Caption>{createdBy}</Caption>
      </Box>
    </Box>
  );
};

export default CardTitleSection;
