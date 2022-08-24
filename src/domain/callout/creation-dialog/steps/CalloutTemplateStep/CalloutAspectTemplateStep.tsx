import React, { FC } from 'react';
import {
  useAspectTemplatesOnCalloutCreationQuery,
  useAspectTemplateValueQuery,
} from '../../../../../hooks/generated/graphql';
import { CalloutType } from '../../../../../models/graphql-schema';
import { useHub } from '../../../../hub/HubContext/useHub';
import AspectTemplatePreview from '../../../../aspect/AspectTemplatePreview/AspectTemplatePreview';
import { TemplateListWithPreview } from './TemplateListWithPreview';
import { CalloutTemplateStepProps } from './CalloutTemplateStepProps';

export interface CalloutAspectTemplateStepProps extends CalloutTemplateStepProps {}

const CalloutAspectTemplateStep: FC<CalloutAspectTemplateStepProps> = ({ callout, onChange }) => {
  const { hubId } = useHub();

  const { data: hubAspectTemplates, loading: aspectTemplatesLoading } = useAspectTemplatesOnCalloutCreationQuery({
    variables: { hubId },
    skip: callout.type !== CalloutType.Card,
  });
  const aspectTemplates =
    hubAspectTemplates?.hub?.templates?.aspectTemplates?.map(x => ({ id: x.id, title: x.info.title })) ?? [];

  const { data: aspectTemplateData, loading: aspectTemplateValueLoading } = useAspectTemplateValueQuery({
    variables: { hubId, id: callout.templateId! },
    skip: callout.type !== CalloutType.Card || !callout.templateId,
  });
  const { type = '', defaultDescription = '', info } = aspectTemplateData?.hub?.templates?.aspectTemplate ?? {};
  const { description = '', tagset } = info ?? {};
  const tags = tagset?.tags ?? [];

  return (
    <TemplateListWithPreview
      templates={aspectTemplates}
      loading={aspectTemplatesLoading}
      selectedTemplateId={callout?.templateId}
      onSelection={onChange}
      templatePreviewComponent={
        <AspectTemplatePreview
          defaultDescription={defaultDescription}
          description={description}
          tags={tags}
          aspectTemplateType={type}
          loading={aspectTemplateValueLoading}
        />
      }
    />
  );
};
export default CalloutAspectTemplateStep;
