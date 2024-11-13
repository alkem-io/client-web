import React from 'react';
import { BeenhereOutlined } from '@mui/icons-material';
import { gutters } from '@core/ui/grid/utils';
import RoundedIcon, { RoundedIconProps } from '@core/ui/icon/RoundedIcon';

interface CardMemberIconProps extends Partial<RoundedIconProps> {}

const CardMemberIcon = (props: CardMemberIconProps) => {
  return (
    <RoundedIcon
      size="small"
      component={BeenhereOutlined}
      position="absolute"
      right={gutters(0.5)}
      top={gutters(0.5)}
      {...props}
    />
  );
};

export default CardMemberIcon;
