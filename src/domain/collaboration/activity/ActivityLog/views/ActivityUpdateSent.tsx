import type { FC } from 'react';
import type { ActivityEventType } from '@/core/apollo/generated/graphql-schema';
import { buildUpdatesUrl } from '@/main/routing/urlBuilders';
import { ActivityBaseView } from './ActivityBaseView';
import ActivitySubjectMarkdown from './ActivitySubjectMarkdown';
import type { ActivityViewProps } from './ActivityViewProps';

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
  spaceDisplayName,
  message,
  type,
  ...rest
}) => {
  const url = buildUpdatesUrl(rest.space?.about?.profile?.url ?? '');

  return (
    <ActivityBaseView
      type={type}
      title={<ActivitySubjectMarkdown>{message}</ActivitySubjectMarkdown>}
      url={url}
      contextDisplayName={spaceDisplayName}
      {...rest}
    />
  );
};
