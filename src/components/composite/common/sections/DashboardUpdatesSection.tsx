import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CommunityUpdatesContainerProps,
  CommunityUpdatesDataContainer,
} from '../../../../containers/community-updates/CommunityUpdates';
import { AvatarsProvider } from '../../../../context/AvatarsProvider';
import { buildUserProfileUrl } from '../../../../utils/urlBuilders';
import SingleUpdateView from '../../../../views/Updates/SingleUpdateView';
import DashboardGenericSection from './DashboardGenericSection';
import {
  EcoverseCommunityMessagesQuery,
  EcoverseCommunityMessagesQueryVariables,
} from '../../../../models/graphql-schema';
import { EcoverseCommunityMessagesDocument } from '../../../../hooks/generated/graphql';

export interface DashboardUpdatesSectionProps {
  entities: CommunityUpdatesContainerProps['entities'];
}

const DashboardUpdatesSection: FC<DashboardUpdatesSectionProps> = ({ entities }) => {
  const { t } = useTranslation();

  return (
    <CommunityUpdatesDataContainer<EcoverseCommunityMessagesQuery, EcoverseCommunityMessagesQueryVariables>
      entities={{
        document: EcoverseCommunityMessagesDocument,
        variables: {
          ecoverseId: entities.ecoverseId,
        },
        messageSelector: data => data?.ecoverse.community?.communication?.updates?.messages || [],
        roomIdSelector: data => data?.ecoverse.community?.communication?.updates?.id || '',
      }}
    >
      {(entities, { retrievingUpdateMessages }) => {
        const messages = [...entities.messages];
        const [latestMessage] = messages.sort((a, b) => b.timestamp - a.timestamp);
        const messageSender = {
          id: latestMessage?.sender,
        };

        return (
          <DashboardGenericSection headerText={t('dashboard-updates-section.title', { count: messages.length })}>
            {!messages.length && !retrievingUpdateMessages ? (
              t('dashboard-updates-section.no-data')
            ) : (
              <AvatarsProvider users={[messageSender]}>
                {populatedUsers => (
                  <SingleUpdateView
                    loading={retrievingUpdateMessages}
                    author={{
                      id: populatedUsers[0].id,
                      displayName: populatedUsers[0].displayName,
                      avatarUrl: populatedUsers[0].profile?.avatar ?? '',
                      firstName: '',
                      lastName: '',
                      url: buildUserProfileUrl(populatedUsers[0].nameID),
                    }}
                    createdDate={new Date(latestMessage.timestamp)}
                    content={latestMessage.message}
                  />
                )}
              </AvatarsProvider>
            )}
          </DashboardGenericSection>
        );
      }}
    </CommunityUpdatesDataContainer>
  );
};
export default DashboardUpdatesSection;
