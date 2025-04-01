import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CommunityUpdatesContainer } from '@/domain/communication/updates/CommunityUpdatesContainer/CommunityUpdatesContainer';
import SingleUpdateView from '@/domain/communication/updates/views/SingleUpdateView';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { buildAuthorFromUser } from '@/domain/community/user/utils/buildAuthorFromUser';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import SeeMore from '@/core/ui/content/SeeMore';
import ShareButton from '../ShareDialog/ShareButton';

export interface DashboardUpdatesSectionProps {
  communityId: string | undefined;
  shareUrl: string;
}

const DashboardUpdatesSection: FC<DashboardUpdatesSectionProps> = ({ communityId, shareUrl }) => {
  const { t } = useTranslation();

  return (
    <CommunityUpdatesContainer communityId={communityId}>
      {(entities, _, { retrievingUpdateMessages }) => {
        const messages = [...entities.messages];
        const [latestMessage] = messages.sort((a, b) => b.timestamp - a.timestamp);
        const latestMessageAuthor = latestMessage?.sender?.id ? buildAuthorFromUser(latestMessage.sender) : undefined;

        return entities.messages.length ? (
          <PageContentBlock>
            <PageContentBlockHeader
              title={t('dashboard-updates-section.title', { count: messages.length })}
              actions={<ShareButton url={shareUrl} entityTypeName="updates" />}
            />
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
            <SeeMore subject={t('common.updates')} to="?dialog=updates" />
          </PageContentBlock>
        ) : (
          <></>
        );
      }}
    </CommunityUpdatesContainer>
  );
};

export default DashboardUpdatesSection;
