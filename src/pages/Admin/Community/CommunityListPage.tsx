import React, { FC, useCallback } from 'react';

import { Loading } from '../../../components/core';
import { useDeleteUserGroup, useHub } from '../../../hooks';
import { useCommunityGroupsQuery } from '../../../hooks/generated/graphql';
import DashboardGenericSection from '../../../components/composite/common/sections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';
import SearchableList, { SearchableListItem } from '../../../components/Admin/SearchableList';
import { Link } from 'react-router-dom';
import Button from '../../../components/core/Button';

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

  const onDelete = useCallback((item: SearchableListItem) => handleDelete(item.id), [handleDelete]);

  if (loading || loadingHub) {
    return <Loading />;
  }

  return (
    <DashboardGenericSection
      headerText={t('common.groups')}
      primaryAction={<Button as={Link} to="groups/new" text={t('buttons.new')} />}
    >
      <SearchableList data={groupsList} onDelete={onDelete} loading={loading} />
    </DashboardGenericSection>
  );
};

export default CommunityGroupListPage;
