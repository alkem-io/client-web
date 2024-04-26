import InnovationFlowCurrentStateSelector from './InnovationFlowCurrentStateSelector';
import { InnovationFlowVisualizerProps } from './InnovationFlowVisualizer';

const InnovationFlowVisualizerMobile = (props: InnovationFlowVisualizerProps) => (
  <InnovationFlowCurrentStateSelector {...props} flexShrink={1} minWidth={0} />
);

export default InnovationFlowVisualizerMobile;
