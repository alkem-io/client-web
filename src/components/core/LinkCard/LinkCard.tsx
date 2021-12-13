import { Card, CardProps, Link } from '@mui/material';
import React, { FC, useState } from 'react';
import { FINAL_ELEVATION, INITAL_ELEVATION } from '../../../models/constants';
import { RouterLink } from '../RouterLink';

interface LinkCardProps extends CardProps {
  to: string;
}

const LinkCard: FC<LinkCardProps> = ({ to, ...rest }) => {
  const [elevation, setElevation] = useState(INITAL_ELEVATION);
  return (
    <Link component={RouterLink} to={to} underline="none">
      <Card
        elevation={elevation}
        onMouseOver={() => setElevation(FINAL_ELEVATION)}
        onMouseOut={() => setElevation(INITAL_ELEVATION)}
        {...rest}
      />
    </Link>
  );
};
export default LinkCard;
