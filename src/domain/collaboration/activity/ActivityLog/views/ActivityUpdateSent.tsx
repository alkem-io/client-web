import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { buildUpdatesUrl } from '../../../../../main/routing/urlBuilders';
import { ActivityEventType } from '../../../../../core/apollo/generated/graphql-schema';
import ActivitySubjectMarkdown from './ActivitySubjectMarkdown';

export interface ActivityUpdateSentViewProps extends ActivityViewProps {
  message: string;
  type: ActivityEventType.UpdateSent;
}

export const ActivityUpdateSentView: FC<ActivityUpdateSentViewProps> = ({
  author,
  loading,
  createdDate,
  journeyUrl,
  journeyDisplayName,
  message,
  type,
  footerComponent,
}) => {
  const url = buildUpdatesUrl(journeyUrl);

  return (
    <ActivityBaseView
      type={type}
      author={author}
      loading={loading}
      title={<ActivitySubjectMarkdown>{message}</ActivitySubjectMarkdown>}
      url={url}
      footerComponent={footerComponent}
      contextDisplayName={journeyDisplayName}
      createdDate={createdDate}
    />
  );
};
