import React from 'react';
import { Box } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';

const SpaceCardSpacing = ({ height = 0.5 }: { height?: number }) => <Box height={gutters(height)} />;

export default SpaceCardSpacing;
