import React, { FC } from 'react';
import {
  useCanvasTemplatesOnCalloutCreationQuery,
  useCanvasTemplateValueQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { CalloutType } from '../../../../../core/apollo/generated/graphql-schema';
import { useHub } from '../../../../challenge/hub/HubContext/useHub';
import CanvasPreview from '../../../canvas/CanvasPreview/CanvasPreview';
import { CalloutTemplateProps } from './CalloutTemplateProps';
import { TemplateListWithPreview } from './TemplateListWithPreview';

export interface CalloutCanvasTemplateProps extends CalloutTemplateProps {}

const CalloutCanvasTemplate: FC<CalloutCanvasTemplateProps> = ({ callout, onChange }) => {
  const { hubId } = useHub();

  const { data: hubCanvasTemplates, loading: canvasTemplatesLoading } = useCanvasTemplatesOnCalloutCreationQuery({
    variables: { hubId },
    skip: callout.type !== CalloutType.Canvas,
  });
  const canvasTemplates =
    hubCanvasTemplates?.hub?.templates?.canvasTemplates?.map(x => ({ id: x.id, title: x.profile.displayName })) ?? [];

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

export default CalloutCanvasTemplate;
