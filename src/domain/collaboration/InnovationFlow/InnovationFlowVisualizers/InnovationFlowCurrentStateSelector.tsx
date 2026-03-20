import { NavigateBeforeOutlined, NavigateNextOutlined } from '@mui/icons-material';
import { Button, IconButton } from '@mui/material';
import Gutters, { type GuttersProps } from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import type { InnovationFlowVisualizerProps } from './InnovationFlowVisualizer';

interface InnovationFlowCurrentStateSelectorProps extends InnovationFlowVisualizerProps {}

const InnovationFlowCurrentStateSelector = ({
  states,
  selectedState: selectedStateName,
  currentState: currentStateName,
  onSelectState,
  ...props
}: InnovationFlowCurrentStateSelectorProps & GuttersProps) => {
  const selectedStateIndex = states.findIndex(state => state.displayName === selectedStateName);

  if (selectedStateIndex === -1) {
    return null;
  }

  const handleSelectPrevState = () => {
    onSelectState?.(states[selectedStateIndex - 1]);
  };

  const handleSelectNextState = () => {
    onSelectState?.(states[selectedStateIndex + 1]);
  };

  const isCurrentState = selectedStateName === currentStateName;

  return (
    <Gutters row={true} gap={1} disablePadding={true} alignItems="center" {...props}>
      <IconButton disabled={selectedStateIndex === 0} onClick={handleSelectPrevState}>
        <NavigateBeforeOutlined />
      </IconButton>
      <Button variant={isCurrentState ? 'contained' : 'outlined'} sx={{ width: gutters(7), flexShrink: 1 }}>
        {states[selectedStateIndex].displayName}
      </Button>
      <IconButton disabled={selectedStateIndex === states.length - 1} onClick={handleSelectNextState}>
        <NavigateNextOutlined />
      </IconButton>
    </Gutters>
  );
};

export default InnovationFlowCurrentStateSelector;
