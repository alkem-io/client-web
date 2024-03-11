import React, { FC } from 'react';
import { Box, Chip, styled } from '@mui/material';
import { InnovationFlowState } from '../../../../collaboration/InnovationFlow/InnovationFlow';

export interface InnovationFlowVisualizerProps {
  states: InnovationFlowState[] | undefined;
  currentState?: string | undefined;
}
const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
}));

// TODO: make this nicer
const InnovationFlowVisualizer: FC<InnovationFlowVisualizerProps> = ({ states, currentState }) => {
  return (
    <Root>
      {states?.map((state, index) => (
        <Chip
          key={`state-${index}`}
          aria-label={state.displayName}
          label={state.displayName}
          color="primary"
          variant={currentState === state.displayName ? 'filled' : 'outlined'}
        />
      ))}
    </Root>
  );
};

export default InnovationFlowVisualizer;
