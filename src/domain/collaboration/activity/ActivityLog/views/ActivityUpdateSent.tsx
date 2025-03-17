import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { buildUpdatesUrl } from '@/main/routing/urlBuilders';
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';
import ActivitySubjectMarkdown from './ActivitySubjectMarkdown';

export interface ActivityUpdateSentViewProps extends ActivityViewProps {
  message: string;
  type: ActivityEventType.UpdateSent;
  space?: {
    about?: {
      profile?: {
        url: string | undefined;
      };
    };
  };
}

export const ActivityUpdateSentView: FC<ActivityUpdateSentViewProps> = ({
  journeyDisplayName,
  message,
  type,
  ...rest
}) => {
  const url = buildUpdatesUrl(rest.space?.about?.profile?.url || '');

  return (
    <ActivityBaseView
      type={type}
      title={<ActivitySubjectMarkdown>{message}</ActivitySubjectMarkdown>}
      url={url}
      contextDisplayName={journeyDisplayName}
      {...rest}
    />
  );
};
