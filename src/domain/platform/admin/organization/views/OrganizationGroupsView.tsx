import React, { FC, useCallback } from 'react';
import { ListPage } from '../../components/ListPage';
import { useNotification } from '@core/ui/notifications/useNotification';
import { useUrlParams } from '@core/routing/useUrlParams';
import { useDeleteGroupMutation, useOrganizationGroupsQuery } from '@core/apollo/generated/apollo-hooks';
import { SearchableTableItem } from '../../components/SearchableTable';
import removeFromCache from '@core/apollo/utils/removeFromCache';
import { useResolvedPath } from 'react-router-dom';
import DashboardGenericSection from '../../../../shared/components/DashboardSections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';

export const OrganizationGroupsView: FC = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const notifySuccess = () => notify('Group deleted successfully!', 'success');

  const { pathname: url } = useResolvedPath('.');
  const { organizationNameId = '' } = useUrlParams();

  const { data } = useOrganizationGroupsQuery({ variables: { id: organizationNameId } });
  const groups = data?.organization?.groups?.map(g => ({
    id: g.id,
    value: g.profile?.displayName || '',
    url: `${url}/groups/${g.id}`,
  }));

  const [deleteGroup] = useDeleteGroupMutation({
    onCompleted: notifySuccess,
  });

  const handleDeleteGroup = useCallback(
    ({ id }: SearchableTableItem) => {
      deleteGroup({
        variables: { input: { ID: id } },
        update: removeFromCache,
      });
    },
    [deleteGroup]
  );

  return (
    <DashboardGenericSection headerText={t('common.groups')}>
      <ListPage data={groups || []} newLink={`${url}/groups/new`} onDelete={handleDeleteGroup} />
    </DashboardGenericSection>
  );
};
