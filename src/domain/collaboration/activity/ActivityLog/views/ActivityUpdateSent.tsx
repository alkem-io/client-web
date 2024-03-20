import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { buildUpdatesUrl } from '../../../../../main/routing/urlBuilders';
import { ActivityEventType } from '../../../../../core/apollo/generated/graphql-schema';
import ActivitySubjectMarkdown from './ActivitySubjectMarkdown';

export interface ActivityUpdateSentViewProps extends ActivityViewProps {
  journeyUrl: string;
  message: string;
  type: ActivityEventType.UpdateSent;
}

export const ActivityUpdateSentView: FC<ActivityUpdateSentViewProps> = ({
  avatarUrl,
  loading,
  createdDate,
  journeyUrl,
  journeyDisplayName,
  message,
  type,
}) => {
  const url = buildUpdatesUrl(journeyUrl);

  return (
    <ActivityBaseView
      type={type}
      avatarUrl={avatarUrl}
      loading={loading}
      title={<ActivitySubjectMarkdown>{message}</ActivitySubjectMarkdown>}
      url={url}
      contextDisplayName={journeyDisplayName}
      createdDate={createdDate}
    />
  );
};
