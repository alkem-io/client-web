import { Card, CardProps } from '@mui/material';
import React, { FC, useState } from 'react';
import { FINAL_ELEVATION, INITIAL_ELEVATION } from '../../../models/constants';
import ConditionalLink from '../ConditionalLink';

interface LinkCardProps extends CardProps {
  to?: string;
  elevationDisabled?: boolean;
}

const LinkCard: FC<LinkCardProps> = ({ to, elevationDisabled = false, ...rest }) => {
  const [elevation, setElevation] = useState(elevationDisabled ? 0 : INITIAL_ELEVATION);
  return (
    <ConditionalLink condition={!!to} to={to}>
      <Card
        elevation={elevation}
        onMouseOver={() => !elevationDisabled && setElevation(FINAL_ELEVATION)}
        onMouseOut={() => !elevationDisabled && setElevation(INITIAL_ELEVATION)}
        {...rest}
      />
    </ConditionalLink>
  );
};
export default LinkCard;
