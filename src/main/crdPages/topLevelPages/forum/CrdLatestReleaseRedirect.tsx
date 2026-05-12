import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { useLatestReleaseDiscussionQuery, usePlatformDiscussionQuery } from '@/core/apollo/generated/apollo-hooks';
import { Loading } from '@/crd/components/common/Loading';

const CrdLatestReleaseRedirect = () => {
  const { t } = useTranslation('crd-forum');

  const { data: latestData, loading: loadingLatest } = useLatestReleaseDiscussionQuery();
  const latestId = latestData?.platform?.latestReleaseDiscussion?.id;

  const { data: discussionData, loading: loadingDiscussion } = usePlatformDiscussionQuery({
    variables: { discussionId: latestId ?? '' },
    skip: !latestId,
  });

  if (loadingLatest || loadingDiscussion) {
    return <Loading text={t('detail.loading')} />;
  }

  if (!latestId) {
    throw new Error('No release discussions found');
  }

  const url = discussionData?.platform.forum.discussion?.profile.url;
  if (!url) {
    return <Loading text={t('detail.loading')} />;
  }

  return <Navigate to={url} replace={true} />;
};

export default CrdLatestReleaseRedirect;
