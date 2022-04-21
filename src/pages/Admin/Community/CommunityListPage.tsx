import React, { FC } from 'react';

import { ListPage } from '../../../components/Admin';
import { Loading } from '../../../components/core';
import { useDeleteUserGroup, useHub } from '../../../hooks';
import { useCommunityGroupsQuery } from '../../../hooks/generated/graphql';
import DashboardGenericSection from '../../../components/composite/common/sections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';

interface CommunityGroupListPageProps {
  communityId: string;
}

export const CommunityGroupListPage: FC<CommunityGroupListPageProps> = ({ communityId }) => {
  const { t } = useTranslation();
  const { hubId, loading: loadingHub } = useHub();

  const { data, loading } = useCommunityGroupsQuery({
    variables: {
      hubId,
      communityId,
    },
  });
  const { handleDelete } = useDeleteUserGroup();

  const community = data?.hub.community;
  const groupsList = community?.groups?.map(u => ({ id: u.id, value: u.name, url: `groups/${u.id}` })) || [];

  if (loading || loadingHub) return <Loading />;

  return (
    <DashboardGenericSection headerText={t('common.groups')}>
      <ListPage
        data={groupsList}
        title={community ? `${community?.displayName} Groups` : 'Groups'}
        onDelete={x => handleDelete(x.id)}
        newLink="groups/new"
      />
    </DashboardGenericSection>
  );
};

export default CommunityGroupListPage;
