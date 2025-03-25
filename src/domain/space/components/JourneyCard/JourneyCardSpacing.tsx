import React from 'react';
import { Box } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';

const JourneyCardSpacing = ({ height = 0.5 }: { height?: number }) => <Box height={gutters(height)} />;

export default JourneyCardSpacing;
