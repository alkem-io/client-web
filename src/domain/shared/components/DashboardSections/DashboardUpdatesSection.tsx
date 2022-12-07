import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CommunityUpdatesContainer,
  CommunityUpdatesContainerProps,
} from '../../../communication/updates/CommunityUpdatesContainer/CommunityUpdatesContainer';
import SingleUpdateView from '../../../communication/updates/views/SingleUpdateView';
import DashboardGenericSection from './DashboardGenericSection';
import { buildAuthorFromUser } from '../../../../common/utils/buildAuthorFromUser';

export interface DashboardUpdatesSectionProps {
  entities: CommunityUpdatesContainerProps['entities'];
}

const DashboardUpdatesSection: FC<DashboardUpdatesSectionProps> = ({ entities: { hubId, communityId } }) => {
  const { t } = useTranslation();

  return (
    <CommunityUpdatesContainer entities={{ hubId, communityId }}>
      {(entities, _, { retrievingUpdateMessages }) => {
        const messages = [...entities.messages];
        const [latestMessage] = messages.sort((a, b) => b.timestamp - a.timestamp);
        const latestMessageAuthor = latestMessage?.sender.id ? buildAuthorFromUser(latestMessage.sender) : undefined;

        return (
          <DashboardGenericSection
            headerText={t('dashboard-updates-section.title', { count: messages.length })}
            navText={t('buttons.see-all')}
            navLink={'dashboard/updates'}
          >
            {retrievingUpdateMessages ? (
              <SingleUpdateView loading={retrievingUpdateMessages} />
            ) : !messages.length && !retrievingUpdateMessages ? (
              t('dashboard-updates-section.no-data')
            ) : (
              <SingleUpdateView
                loading={retrievingUpdateMessages}
                author={latestMessageAuthor}
                createdDate={new Date(latestMessage.timestamp)}
                content={latestMessage.message}
              />
            )}
          </DashboardGenericSection>
        );
      }}
    </CommunityUpdatesContainer>
  );
};
export default DashboardUpdatesSection;
