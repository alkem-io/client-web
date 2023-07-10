import React from 'react';
import { Link, LinkProps } from '@mui/material';

const LinkButton = ({ onClick, ...props }: LinkProps) => {
  const handleClick = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    event.preventDefault();
    onClick?.(event);
  };

  return <Link href="" onClick={handleClick} {...props} />;
};

export default LinkButton;
