import React, { FC, useMemo } from 'react';
import {
  refetchPlatformAdminSpacesListQuery,
  usePlatformAdminSpacesListQuery,
  useDeleteSpaceMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import Loading from '@/core/ui/loading/Loading';
import ListPage from '@/domain/platformAdmin/components/ListPage';
import { SearchableTableItem } from '@/domain/platformAdmin/components/SearchableTable';
import { AuthorizationPrivilege, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import SpaceListItem from './SpaceListItem';

/**
 * SpaceListV2 - Optimized version that loads minimal data upfront
 * License plan data is fetched on-demand when the manage license dialog is opened
 */
export const SpaceList: FC = () => {
  const notify = useNotification();
  const { t } = useTranslation();

  const { data: spacesData, loading: loadingSpaces } = usePlatformAdminSpacesListQuery();

  const spaceList = useMemo(() => {
    const spaces = spacesData?.platformAdmin.spaces ?? [];

    return spaces.map(space => {
      const displayName =
        space.visibility !== SpaceVisibility.Active
          ? `${space.about.profile.displayName} [${space.visibility.toUpperCase()}]`
          : space.about.profile.displayName;

      const canUpdate = (space.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Update);

      return {
        id: space.id,
        spaceId: space.id,
        nameId: space.nameID,
        visibility: space.visibility,
        url: buildSettingsUrl(space.about.profile.url),
        value: displayName,
        canUpdate,
      };
    });
  }, [spacesData]);

  const [deleteSpace] = useDeleteSpaceMutation({
    refetchQueries: [refetchPlatformAdminSpacesListQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('pages.admin.space.notifications.space-removed'), 'success'),
  });

  const handleDelete = (item: SearchableTableItem) => {
    deleteSpace({
      variables: {
        spaceId: item.id,
      },
    });
  };

  if (loadingSpaces) return <Loading text={'Loading spaces'} />;

  return (
    <ListPage
      data={spaceList}
      onDelete={spaceList.length > 1 ? handleDelete : undefined}
      itemViewComponent={SpaceListItem}
    />
  );
};

export default SpaceList;
