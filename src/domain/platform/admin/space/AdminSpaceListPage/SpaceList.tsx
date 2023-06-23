import React, { FC, useMemo } from 'react';

import {
  refetchAdminSpacesListQuery,
  useAdminSpacesListQuery,
  useDeleteSpaceMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import Loading from '../../../../../common/components/core/Loading/Loading';
import ListPage from '../../components/ListPage';
import { SearchableListItem, searchableListItemMapper } from '../../components/SearchableList';
import { AuthorizationPrivilege, SpaceVisibility } from '../../../../../core/apollo/generated/graphql-schema';
import { useResolvedPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buildAdminSpaceUrl } from '../../../../../common/utils/urlBuilders';
import SpaceListItem from './SpaceListItem';

export const SpaceList: FC = () => {
  const { pathname: url } = useResolvedPath('.');
  const notify = useNotification();
  const { t } = useTranslation();

  const { data: spacesData, loading: loadingSpaces } = useAdminSpacesListQuery();
  const spaceList = useMemo(() => {
    return (
      spacesData?.spaces
        .filter(space =>
          (space.authorization?.myPrivileges ?? []).find(privilege => privilege === AuthorizationPrivilege.Update)
        )
        .map(space => {
          if (space.visibility !== SpaceVisibility.Active) {
            return {
              ...space,
              profile: {
                ...space.profile,
                displayName: `${space.profile.displayName} [${space.visibility.toUpperCase()}]`,
              },
            };
          }
          return space;
        })
        .map(space => ({
          ...space,
          displayName: space.profile.displayName,
          url: buildAdminSpaceUrl(space.nameID),
        }))
        .map(space => ({
          ...searchableListItemMapper()(space),
          spaceId: space.id,
          visibility: space.visibility,
        })) ?? []
    );
  }, [spacesData]);

  const [deleteSpace] = useDeleteSpaceMutation({
    refetchQueries: [refetchAdminSpacesListQuery()],
    awaitRefetchQueries: true,
    onCompleted: data =>
      notify(t('pages.admin.space.notifications.space-removed', { name: data.deleteSpace.nameID }), 'success'),
  });

  const handleDelete = (item: SearchableListItem) => {
    deleteSpace({
      variables: {
        input: {
          ID: item.id,
        },
      },
    });
  };

  if (loadingSpaces) return <Loading text={'Loading spaces'} />;

  return (
    <ListPage
      data={spaceList}
      newLink={`${url}/new`}
      onDelete={spaceList.length > 1 ? handleDelete : undefined}
      itemViewComponent={SpaceListItem}
    />
  );
};

export default SpaceList;
