import React, { FC } from 'react';
import { useCanvasTemplateValueQuery } from '../../../../../hooks/generated/graphql';
import { useHub } from '../../../../challenge/hub/HubContext/useHub';
import CanvasPreview from '../../../../canvas/CanvasPreview/CanvasPreview';
import { CalloutStepProps } from '../CalloutStepProps';

export interface CalloutAspectSummaryStepProps extends CalloutStepProps {}

const CalloutCanvasSummary: FC<CalloutAspectSummaryStepProps> = ({ callout }) => {
  const { hubId } = useHub();

  const { data: canvasTemplateData, loading: canvasTemplateValueLoading } = useCanvasTemplateValueQuery({
    variables: { hubId, id: callout.templateId! },
  });
  const value = canvasTemplateData?.hub?.templates?.canvasTemplate?.value ?? '';

  return <CanvasPreview value={value} loading={canvasTemplateValueLoading} />;
};
export default CalloutCanvasSummary;
