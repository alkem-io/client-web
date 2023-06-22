import React, { FC } from 'react';
import {
  useWhiteboardTemplatesOnCalloutCreationQuery,
  useWhiteboardTemplateValueQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { CalloutType } from '../../../../../core/apollo/generated/graphql-schema';
import { useHub } from '../../../../challenge/hub/HubContext/useHub';
import WhiteboardPreview from '../../../whiteboard/WhiteboardPreview/WhiteboardPreview';
import { CalloutTemplateProps } from './CalloutTemplateProps';
import { TemplateListWithPreview } from './TemplateListWithPreview';

export interface CalloutWhiteboardTemplateProps extends CalloutTemplateProps {}

const CalloutWhiteboardTemplate: FC<CalloutWhiteboardTemplateProps> = ({ callout, onChange }) => {
  const { hubId } = useHub();

  const { data: hubWhiteboardTemplates, loading: whiteboardTemplatesLoading } =
    useWhiteboardTemplatesOnCalloutCreationQuery({
      variables: { hubId },
      skip: callout.type !== CalloutType.Whiteboard,
    });
  const whiteboardTemplates =
    hubWhiteboardTemplates?.hub?.templates?.whiteboardTemplates?.map(x => ({
      id: x.id,
      title: x.profile.displayName,
    })) ?? [];

  const { data: whiteboardTemplateData, loading: whiteboardTemplateValueLoading } = useWhiteboardTemplateValueQuery({
    variables: { hubId, id: callout.templateId! },
    skip: callout.type !== CalloutType.Whiteboard || !callout.templateId,
  });
  const value = whiteboardTemplateData?.hub?.templates?.whiteboardTemplate?.value ?? '';

  return (
    <TemplateListWithPreview
      templates={whiteboardTemplates}
      loading={whiteboardTemplatesLoading}
      selectedTemplateId={callout?.templateId}
      onSelection={onChange}
      templatePreviewComponent={<WhiteboardPreview value={value} loading={whiteboardTemplateValueLoading} />}
    />
  );
};

export default CalloutWhiteboardTemplate;
