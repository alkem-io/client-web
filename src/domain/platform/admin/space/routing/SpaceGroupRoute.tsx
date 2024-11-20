import { useUrlParams } from '@/core/routing/useUrlParams';
import { useSpaceGroupQuery } from '@/core/apollo/generated/apollo-hooks';
import { GroupRoute } from '@/domain/platform/admin/routing/GroupRoute';

export const SpaceGroupRoute = ({ parentCommunityId }: { parentCommunityId: string | undefined }) => {
  const { groupId = '', spaceNameId = '' } = useUrlParams();

  const { data, loading } = useSpaceGroupQuery({
    variables: { spaceNameId, groupId },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    skip: !spaceNameId || !groupId,
  });

  return <GroupRoute loading={loading} group={data?.space?.community?.group} parentCommunityId={parentCommunityId} />;
};
