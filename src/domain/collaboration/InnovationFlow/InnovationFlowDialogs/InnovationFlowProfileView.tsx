import { FC } from 'react';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { InnovationFlowProfileBlockProps } from './InnovationFlowProfileBlock';

interface InnovationFlowProfileViewProps {
  innovationFlow: InnovationFlowProfileBlockProps['innovationFlow'];
}

const InnovationFlowProfileView: FC<InnovationFlowProfileViewProps> = ({ innovationFlow }) => {
  return (
    <>
      {/* Innovation flow name is shown in the header */}
      <WrapperMarkdown>{innovationFlow?.profile.description ?? ''}</WrapperMarkdown>
    </>
  );
};

export default InnovationFlowProfileView;
