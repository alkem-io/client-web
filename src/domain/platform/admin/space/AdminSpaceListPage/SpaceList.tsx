import React, { FC, useMemo } from 'react';

import {
  refetchAdminSpacesListQuery,
  useAdminSpacesListQuery,
  useDeleteSpaceMutation,
  useOrganizationsListQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import Loading from '../../../../../core/ui/loading/Loading';
import ListPage from '../../components/ListPage';
import { SearchableListItem, searchableListItemMapper } from '../../components/SearchableList';
import {
  AuthorizationPrivilege,
  LicenseFeatureFlagName,
  SpaceVisibility,
} from '../../../../../core/apollo/generated/graphql-schema';
import { useResolvedPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buildSettingsUrl } from '../../../../../main/routing/urlBuilders';
import SpaceListItem from './SpaceListItem';
import { sortBy } from 'lodash';
import { licenseHasFeature } from '../../../../journey/space/license/useLicenseFeatures';

export const SpaceList: FC = () => {
  const { pathname: url } = useResolvedPath('.');
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
          if (space.account.license.visibility !== SpaceVisibility.Active) {
            return {
              ...space,
              profile: {
                ...space.profile,
                displayName: `${space.profile.displayName} [${space.account.license.visibility.toUpperCase()}]`,
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
        .map(space => ({
          ...searchableListItemMapper()(space),
          spaceId: space.id,
          accountId: space.account.id,
          nameId: space.nameID,
          account: {
            visibility: space.account.license.visibility,
            // TODO: Temporarily removed host field because of it gives an error trying to access it
            hostId: undefined, // space.account.host?.id,
            features: Object.values(LicenseFeatureFlagName).reduce((acc, licenseFeature) => {
              acc[licenseFeature] = licenseHasFeature(licenseFeature, space.account.license);
              return acc;
            }, {} as Record<LicenseFeatureFlagName, boolean>),
            organizations,
          },
        })) ?? []
    );
  }, [spacesData, organizations]);

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
