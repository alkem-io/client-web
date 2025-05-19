import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { InnovationFlowProfileModel } from '../models/InnovationFlowProfileModel';

const InnovationFlowProfileView = ({
  innovationFlow,
}: {
  innovationFlow:
    | {
        id: string;
        profile: InnovationFlowProfileModel;
      }
    | undefined;
}) => (
  <>
    {/* Innovation flow name is shown in the header */}
    <WrapperMarkdown>{innovationFlow?.profile.description ?? ''}</WrapperMarkdown>
    {/* Keeping this file because maybe (probably) we'll add tags and references at some point */}
  </>
);

export default InnovationFlowProfileView;
