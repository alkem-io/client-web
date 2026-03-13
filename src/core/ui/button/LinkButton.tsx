import { Link, type LinkProps } from '@mui/material';
import type React from 'react';

const LinkButton = ({ onClick, ...props }: LinkProps) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    onClick?.(event);
  };

  return <Link href="" onClick={handleClick} {...props} />;
};

export default LinkButton;
