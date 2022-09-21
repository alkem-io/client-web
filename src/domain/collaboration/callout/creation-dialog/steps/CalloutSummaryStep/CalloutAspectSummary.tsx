import React, { FC } from 'react';
import { useAspectTemplateValueQuery } from '../../../../../../hooks/generated/graphql';
import { useHub } from '../../../../../challenge/hub/HubContext/useHub';
import AspectTemplatePreview from '../../../../aspect/AspectTemplatePreview/AspectTemplatePreview';
import { CalloutStepProps } from '../CalloutStepProps';

export interface CalloutAspectSummaryStepProps extends CalloutStepProps {}

const CalloutAspectSummary: FC<CalloutAspectSummaryStepProps> = ({ callout }) => {
  const { hubId } = useHub();

  const { data: aspectTemplateData, loading: aspectTemplateValueLoading } = useAspectTemplateValueQuery({
    variables: { hubId, id: callout.templateId! },
  });

  const { type = '', defaultDescription = '', info } = aspectTemplateData?.hub?.templates?.aspectTemplate ?? {};
  const { description = '', tagset } = info ?? {};
  const tags = tagset?.tags ?? [];

  return (
    <>
      <hr />
      <AspectTemplatePreview
        defaultDescription={defaultDescription}
        description={description}
        tags={tags}
        aspectTemplateType={type}
        loading={aspectTemplateValueLoading}
      />
    </>
  );
};
export default CalloutAspectSummary;
