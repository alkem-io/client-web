import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CommunityUpdatesContainer,
  CommunityUpdatesContainerProps,
} from '../../../../containers/community-updates/CommunityUpdatesContainer';
import { AvatarsProvider } from '../../../../context/AvatarsProvider';
import { buildUserProfileUrl } from '../../../../utils/urlBuilders';
import SingleUpdateView from '../../../../views/Updates/SingleUpdateView';
import DashboardGenericSection from './DashboardGenericSection';

export interface DashboardUpdatesSectionProps {
  entities: CommunityUpdatesContainerProps['entities'];
}

const DashboardUpdatesSection: FC<DashboardUpdatesSectionProps> = ({ entities: { ecoverseId, communityId } }) => {
  const { t } = useTranslation();

  return (
    <CommunityUpdatesContainer entities={{ ecoverseId, communityId }}>
      {(entities, _, { retrievingUpdateMessages }) => {
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
    </CommunityUpdatesContainer>
  );
};
export default DashboardUpdatesSection;
