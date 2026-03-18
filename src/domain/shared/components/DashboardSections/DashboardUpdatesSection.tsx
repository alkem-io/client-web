import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import SeeMore from '@/core/ui/content/SeeMore';
import useCommunityUpdates from '@/domain/communication/updates/CommunityUpdatesContainer/useCommunityUpdates';
import SingleUpdateView from '@/domain/communication/updates/views/SingleUpdateView';
import { buildAuthorFromUser } from '@/domain/community/user/utils/buildAuthorFromUser';
import ShareButton from '../ShareDialog/ShareButton';

export interface DashboardUpdatesSectionProps {
  communityId: string | undefined;
  shareUrl: string;
}

const DashboardUpdatesSection: FC<DashboardUpdatesSectionProps> = ({ communityId, shareUrl }) => {
  const { t } = useTranslation();

  const {
    entities,
    state: { retrievingUpdateMessages },
  } = useCommunityUpdates({ communityId });

  const messages = [...entities.messages];
  const [latestMessage] = messages.sort((a, b) => b.timestamp - a.timestamp);
  const sender = latestMessage?.sender;
  const latestMessageAuthor = sender?.id ? buildAuthorFromUser(sender) : undefined;

  if (!entities.messages.length) {
    return null;
  }

  return (
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
      {/* The Updates dialog is in the first tab, SpaceDashboardPage */}
      <SeeMore subject={t('common.updates')} to={shareUrl} />
    </PageContentBlock>
  );
};

export default DashboardUpdatesSection;
