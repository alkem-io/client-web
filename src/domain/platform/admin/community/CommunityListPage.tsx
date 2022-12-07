import React, { FC, useCallback, useMemo } from 'react';
import { Loading } from '../../../../common/components/core';
import { useHub } from '../../../challenge/hub/HubContext/useHub';
import { useDeleteUserGroup } from '../components/Group/useDeleteUserGroup';
import { useCommunityGroupsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';
import SearchableList, { SearchableListItem } from '../components/SearchableList';
import { Link } from 'react-router-dom';
import WrapperButton from '../../../../common/components/core/WrapperButton';

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
    skip: !hubId,
  });

  const { handleDelete } = useDeleteUserGroup();

  const community = data?.hub.community;
  const groupsList = useMemo(
    () => community?.groups?.map(u => ({ id: u.id, value: u.name, url: `groups/${u.id}` })) || [],
    [community?.groups]
  );
  const onDelete = useCallback((item: SearchableListItem) => handleDelete(item.id), [handleDelete]);

  if (loading || loadingHub) {
    return <Loading />;
  }

  return (
    <DashboardGenericSection
      headerText={t('common.groups')}
      primaryAction={<WrapperButton as={Link} to="groups/new" text={t('buttons.new')} />}
    >
      <SearchableList data={groupsList} onDelete={onDelete} loading={loading} />
    </DashboardGenericSection>
  );
};

export default CommunityGroupListPage;
