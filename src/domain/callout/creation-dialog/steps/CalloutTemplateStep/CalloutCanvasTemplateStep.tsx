import React, { FC } from 'react';
import { Skeleton } from '@mui/material';
import { TemplateListWithPreview } from './TemplateListWithPreview';
import { useCanvasTemplatesOnCalloutCreationQuery, useCanvasTemplateValueQuery } from '../../../../../hooks/generated/graphql';
import { CalloutType } from '../../../../../models/graphql-schema';
import { CalloutTemplateStepProps } from './CalloutTemplateStepProps';
import { useHub } from '../../../../hub/HubContext/useHub';
import CanvasWhiteboard from '../../../../../components/composite/entities/Canvas/CanvasWhiteboard';

export interface CalloutCanvasTemplateStepProps extends CalloutTemplateStepProps {}

const CalloutCanvasTemplateStep: FC<CalloutCanvasTemplateStepProps> = ({ callout, onChange }) => {
  const { hubId } = useHub();

  const { data: hubCanvasTemplates, loading: canvasTemplatesLoading } = useCanvasTemplatesOnCalloutCreationQuery(    {
    variables: { hubId },
    skip: callout.type !== CalloutType.Canvas,
  });
  const canvasTemplates = hubCanvasTemplates?.hub?.templates?.canvasTemplates?.map(x => ({ id: x.id, title: x.info.title })) ?? [];

  const { data: canvasTemplateData, loading: canvasTemplateValueLoading } = useCanvasTemplateValueQuery({
    variables: { hubId, id: callout.templateId! },
    skip: callout.type !== CalloutType.Canvas || !callout.templateId,
    initialFetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-only',
  });
  const value = canvasTemplateData?.hub?.templates?.canvasTemplate?.value ?? '';

  return (
    <TemplateListWithPreview
      templates={canvasTemplates}
      loading={canvasTemplatesLoading}
      selectedTemplateId={callout?.templateId}
      onSelection={onChange}
      templatePreviewComponent={
        <CanvasPreview value={value} loading={canvasTemplateValueLoading} />
      }
    />
  );
};
export default CalloutCanvasTemplateStep;

const CanvasPreview: FC<{ value: string, loading: boolean | undefined }> = ({ value, loading }) => {
  if (loading) {
    return <Skeleton variant="rectangular" />;
  }

  return (
    <CanvasWhiteboard
      entities={{ canvas: { id: '__template', value } }}
      actions={{}}
      options={{
        viewModeEnabled: true,
        UIOptions: {
          canvasActions: {
            export: false,
          },
        },
      }}
    />
  )
};
