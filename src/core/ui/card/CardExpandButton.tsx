import { Box } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import React from 'react';

interface CardExpandButtonProps {
  expanded: boolean;
}

const CardExpandButton = ({ expanded }: CardExpandButtonProps) => {
  return (
    <Box display="flex" marginRight={-0.5} alignItems="end">
      {expanded ? <ExpandLess /> : <ExpandMore />}
    </Box>
  );
};

export default CardExpandButton;
