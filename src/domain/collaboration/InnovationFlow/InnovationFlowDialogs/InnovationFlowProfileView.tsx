import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { InnovationFlowProfileBlockProps } from './InnovationFlowProfileBlock';

const InnovationFlowProfileView = ({
  innovationFlow,
}: {
  innovationFlow: InnovationFlowProfileBlockProps['innovationFlow'];
}) => (
  <>
    {/* Innovation flow name is shown in the header */}
    <WrapperMarkdown>{innovationFlow?.profile.description ?? ''}</WrapperMarkdown>
    {/* Keeping this file because maybe (probably) we'll add tags and references at some point */}
  </>
);

export default InnovationFlowProfileView;
