import { FC } from 'react';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { useRecentForumMessagesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useTranslation } from 'react-i18next';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import SeeMore from '../../../../core/ui/content/SeeMore';
import { DiscussionListView } from '../../../../domain/communication/discussion/views/DiscussionsListView';
import { useDiscussionMapper } from '../../../../domain/communication/discussion/models/Discussion';
import { compact } from 'lodash';
import useNavigate from '../../../../core/routing/useNavigate';

interface RecentForumMessagesProps {}

const RecentForumMessages: FC<RecentForumMessagesProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, loading: loadingDiscussions } = useRecentForumMessagesQuery();

  const { discussionMapper } = useDiscussionMapper(
    compact(data?.platform.communication.discussions?.map(d => d.createdBy))
  );

  const handleClickDiscussion = (discussionUrl: string) => {
    navigate(discussionUrl);
  };

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('pages.home.sections.forumMessages.title')} />
      <DiscussionListView
        entities={{
          discussions: data?.platform.communication.discussions?.map(discussionMapper) ?? [],
        }}
        state={{ loading: loadingDiscussions }}
        actions={{
          onClickDiscussion: discussion => handleClickDiscussion(discussion.url),
        }}
        options={{ filterEnabled: false }}
      />
      <SeeMore label="pages.home.sections.forumMessages.seeMore" to="/forum" />
    </PageContentBlock>
  );
};

export default RecentForumMessages;
