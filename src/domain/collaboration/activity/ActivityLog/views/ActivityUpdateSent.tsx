import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { buildUpdatesUrl } from '../../../../../main/routing/urlBuilders';
import { ActivityEventType } from '../../../../../core/apollo/generated/graphql-schema';
import ActivitySubjectMarkdown from './ActivitySubjectMarkdown';

export interface ActivityUpdateSentViewProps extends ActivityViewProps {
  journeyUrl?: string;
  message: string;
  type: ActivityEventType.UpdateSent;
}

export const ActivityUpdateSentView: FC<ActivityUpdateSentViewProps> = ({
  journeyUrl,
  journeyDisplayName,
  message,
  type,
  ...rest
}) => {
  const url = buildUpdatesUrl(journeyUrl ?? '');

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
