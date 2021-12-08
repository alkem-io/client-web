import { Card, CardProps, Link } from '@mui/material';
import React, { FC, useState } from 'react';
import { RouterLink } from '../RouterLink';

interface LinkCardProps extends CardProps {
  to: string;
}

const INITAL_ELEVATION = 1;
const FINAL_ELEVATION = 8;

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
