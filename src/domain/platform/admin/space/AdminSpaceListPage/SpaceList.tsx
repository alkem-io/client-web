import React, { FC, useMemo } from 'react';

import {
  refetchAdminSpacesListQuery,
  useAdminSpacesListQuery,
  useDeleteSpaceMutation,
  useOrganizationsListQuery,
} from '@core/apollo/generated/apollo-hooks';
import { useNotification } from '@core/ui/notifications/useNotification';
import Loading from '@core/ui/loading/Loading';
import ListPage from '../../components/ListPage';
import { SearchableTableItem, SearchableTableItemMapper } from '../../components/SearchableTable';
import { AuthorizationPrivilege, SpaceVisibility } from '@core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import { buildSettingsUrl } from '@main/routing/urlBuilders';
import SpaceListItem from './SpaceListItem';
import { sortBy } from 'lodash';

export const SpaceList: FC = () => {
  const notify = useNotification();
  const { t } = useTranslation();

  const { data: spacesData, loading: loadingSpaces } = useAdminSpacesListQuery();
  const { data: organizationData } = useOrganizationsListQuery();
  const organizations = useMemo(() => {
    const organizationNames =
      organizationData?.organizations.map(org => ({ id: org.id, name: org.profile.displayName })) ?? [];
    return sortBy(organizationNames, org => org.name);
  }, [organizationData]);

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
          url: buildSettingsUrl(space.profile.url),
        }))
        .map(space => {
          const activeLicenseCredentials = space.subscriptions.map(subscription => subscription.name);
          // TODO filter out expired ones
          const activeLicensePlanIds = spacesData?.platform.licensing.plans
            .filter(({ licenseCredential }) => activeLicenseCredentials.includes(licenseCredential))
            .map(({ id }) => id);

          return {
            ...SearchableTableItemMapper()(space),
            spaceId: space.id,
            nameId: space.nameID,
            visibility: space.visibility,
            activeLicensePlanIds,
            licensePlans: spacesData?.platform.licensing.plans,
          };
        }) ?? []
    );
  }, [spacesData, organizations]);

  const [deleteSpace] = useDeleteSpaceMutation({
    refetchQueries: [refetchAdminSpacesListQuery()],
    awaitRefetchQueries: true,
    onCompleted: data =>
      notify(t('pages.admin.space.notifications.space-removed', { name: data.deleteSpace.nameID }), 'success'),
  });

  const handleDelete = (item: SearchableTableItem) => {
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
      onDelete={spaceList.length > 1 ? handleDelete : undefined}
      itemViewComponent={SpaceListItem}
    />
  );
};

export default SpaceList;
