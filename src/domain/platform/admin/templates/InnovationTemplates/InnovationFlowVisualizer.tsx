import React, { FC } from 'react';
import { Box } from '@mui/material';
import { InnovationFlowState } from '../../../../collaboration/InnovationFlow/InnovationFlow';

export interface InnovationFlowVisualizerProps {
  states: InnovationFlowState[] | undefined;
  currentState: string | undefined;
}
// TODO: make this nicer
const InnovationFlowVisualizer: FC<InnovationFlowVisualizerProps> = ({ states }) => {
  return (
    <Box>
      InnovationFlow:{states?.map((state) => <>{state.displayName}, </>)}
    </Box>
  );
};

export default InnovationFlowVisualizer;
