import React, { FC, useMemo } from 'react';

import {
  refetchAdminHubsListQuery,
  useAdminHubsListQuery,
  useDeleteHubMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import Loading from '../../../../../common/components/core/Loading/Loading';
import ListPage from '../../components/ListPage';
import { SearchableListItem, searchableListItemMapper } from '../../components/SearchableList';
import { AuthorizationPrivilege, HubVisibility } from '../../../../../core/apollo/generated/graphql-schema';
import { useResolvedPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buildAdminHubUrl } from '../../../../../common/utils/urlBuilders';

export const HubList: FC = () => {
  const { pathname: url } = useResolvedPath('.');
  const notify = useNotification();
  const { t } = useTranslation();

  const { data: hubsData, loading: loadingHubs } = useAdminHubsListQuery();
  const hubList = useMemo(() => {
    return (
      hubsData?.hubs
        .filter(x => (x.authorization?.myPrivileges ?? []).find(y => y === AuthorizationPrivilege.Update))
        .map(x => {
          if (x.visibility !== HubVisibility.Active) {
            return { ...x, displayName: `${x.displayName} [${x.visibility.toUpperCase()}]` };
          }
          return x;
        })
        .map(hub => ({
          ...hub,
          url: buildAdminHubUrl(hub.nameID),
        }))
        .map(searchableListItemMapper()) ?? []
    );
  }, [hubsData]);

  const [deleteHub] = useDeleteHubMutation({
    refetchQueries: [refetchAdminHubsListQuery()],
    awaitRefetchQueries: true,
    onCompleted: data =>
      notify(t('pages.admin.hub.notifications.hub-removed', { name: data.deleteHub.displayName }), 'success'),
  });

  const handleDelete = (item: SearchableListItem) => {
    deleteHub({
      variables: {
        input: {
          ID: item.id,
        },
      },
    });
  };

  if (loadingHubs) return <Loading text={'Loading hubs'} />;

  return <ListPage data={hubList} newLink={`${url}/new`} onDelete={hubList.length > 1 ? handleDelete : undefined} />;
};

export default HubList;
