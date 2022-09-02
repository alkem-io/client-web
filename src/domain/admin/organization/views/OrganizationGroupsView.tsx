import React, { FC, useCallback } from 'react';

import { ListPage } from '../../components/ListPage';
import { useApolloErrorHandler, useNotification, useUrlParams } from '../../../../hooks';
import { useDeleteGroupMutation, useOrganizationGroupsQuery } from '../../../../hooks/generated/graphql';
import { SearchableListItem } from '../../components/SearchableList';
import removeFromCache from '../../../shared/utils/apollo-cache/removeFromCache';
import { useResolvedPath } from 'react-router-dom';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';

export const OrganizationGroupsView: FC = () => {
  const { t } = useTranslation();
  const handleError = useApolloErrorHandler();
  const notify = useNotification();
  const notifySuccess = () => notify('Group deleted successfully!', 'success');

  const { pathname: url } = useResolvedPath('.');
  const { organizationNameId = '' } = useUrlParams();

  const { data } = useOrganizationGroupsQuery({ variables: { id: organizationNameId } });
  const groups = data?.organization?.groups?.map(g => ({ id: g.id, value: g.name, url: `${url}/groups/${g.id}` }));

  const [deleteGroup] = useDeleteGroupMutation({
    onError: handleError,
    onCompleted: notifySuccess,
  });

  const handleDeleteGroup = useCallback(
    ({ id }: SearchableListItem) => {
      deleteGroup({
        variables: { input: { ID: id } },
        update: removeFromCache,
      });
    },
    [groups]
  );

  return (
    <DashboardGenericSection headerText={t('common.groups')}>
      <ListPage data={groups || []} newLink={`${url}/groups/new`} onDelete={handleDeleteGroup} />
    </DashboardGenericSection>
  );
};
