import React, { FC } from 'react';
import {
  useCanvasTemplatesOnCalloutCreationQuery,
  useCanvasTemplateValueQuery,
} from '../../../../../hooks/generated/graphql';
import { CalloutType } from '../../../../../models/graphql-schema';
import { useHub } from '../../../../hub/HubContext/useHub';
import CanvasPreview from '../../../../canvas/CanvasPreview/CanvasPreview';
import { CalloutTemplateStepProps } from './CalloutTemplateStepProps';
import { TemplateListWithPreview } from './TemplateListWithPreview';

export interface CalloutCanvasTemplateStepProps extends CalloutTemplateStepProps {}

const CalloutCanvasTemplateStep: FC<CalloutCanvasTemplateStepProps> = ({ callout, onChange }) => {
  const { hubId } = useHub();

  const { data: hubCanvasTemplates, loading: canvasTemplatesLoading } = useCanvasTemplatesOnCalloutCreationQuery({
    variables: { hubId },
    skip: callout.type !== CalloutType.Canvas,
  });
  const canvasTemplates =
    hubCanvasTemplates?.hub?.templates?.canvasTemplates?.map(x => ({ id: x.id, title: x.info.title })) ?? [];

  const { data: canvasTemplateData, loading: canvasTemplateValueLoading } = useCanvasTemplateValueQuery({
    variables: { hubId, id: callout.templateId! },
    skip: callout.type !== CalloutType.Canvas || !callout.templateId,
  });
  const value = canvasTemplateData?.hub?.templates?.canvasTemplate?.value ?? '';

  return (
    <TemplateListWithPreview
      templates={canvasTemplates}
      loading={canvasTemplatesLoading}
      selectedTemplateId={callout?.templateId}
      onSelection={onChange}
      templatePreviewComponent={<CanvasPreview value={value} loading={canvasTemplateValueLoading} />}
    />
  );
};
export default CalloutCanvasTemplateStep;
