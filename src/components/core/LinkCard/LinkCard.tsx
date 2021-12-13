import { Card, CardProps } from '@mui/material';
import React, { FC, useState } from 'react';
import { FINAL_ELEVATION, INITIAL_ELEVATION } from '../../../models/constants';
import ConditionalLink from '../ConditionalLink';

interface LinkCardProps extends CardProps {
  to?: string;
}

const LinkCard: FC<LinkCardProps> = ({ to, ...rest }) => {
  const [elevation, setElevation] = useState(INITIAL_ELEVATION);
  return (
    <ConditionalLink condition={!!to} to={to}>
      <Card
        elevation={elevation}
        onMouseOver={() => setElevation(FINAL_ELEVATION)}
        onMouseOut={() => setElevation(INITIAL_ELEVATION)}
        {...rest}
      />
    </ConditionalLink>
  );
};
export default LinkCard;
