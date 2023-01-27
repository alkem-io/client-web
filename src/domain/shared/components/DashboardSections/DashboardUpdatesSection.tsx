import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CommunityUpdatesContainer,
  CommunityUpdatesContainerProps,
} from '../../../communication/updates/CommunityUpdatesContainer/CommunityUpdatesContainer';
import SingleUpdateView from '../../../communication/updates/views/SingleUpdateView';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { buildAuthorFromUser } from '../../../../common/utils/buildAuthorFromUser';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import SeeMore from '../../../../core/ui/content/SeeMore';

export interface DashboardUpdatesSectionProps {
  entities: CommunityUpdatesContainerProps['entities'];
}

const DashboardUpdatesSection: FC<DashboardUpdatesSectionProps> = ({ entities: { hubId, communityId } }) => {
  const { t } = useTranslation();

  return (
    <CommunityUpdatesContainer entities={{ hubId, communityId }}>
      {(entities, _, { retrievingUpdateMessages }) => {
        const messages = [...entities.messages];
        const [latestMessage] = messages.sort((a, b) => b.date.getUTCMilliseconds() - a.date.getUTCMilliseconds());
        const latestMessageAuthor = latestMessage?.sender.id ? buildAuthorFromUser(latestMessage.sender) : undefined;

        return (
          <PageContentBlock>
            <PageContentBlockHeader title={t('dashboard-updates-section.title', { count: messages.length })} />
            {retrievingUpdateMessages ? (
              <SingleUpdateView loading={retrievingUpdateMessages} />
            ) : !messages.length && !retrievingUpdateMessages ? (
              t('dashboard-updates-section.no-data')
            ) : (
              <SingleUpdateView
                loading={retrievingUpdateMessages}
                author={latestMessageAuthor}
                createdDate={latestMessage.date}
                content={latestMessage.message}
              />
            )}
            <SeeMore subject={t('common.updates')} to="dashboard/updates" />
          </PageContentBlock>
        );
      }}
    </CommunityUpdatesContainer>
  );
};

export default DashboardUpdatesSection;
