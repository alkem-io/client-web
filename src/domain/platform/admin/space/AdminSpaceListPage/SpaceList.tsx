import React, { FC, useMemo } from 'react';

import {
  refetchAdminSpacesListQuery,
  useAdminSpacesListQuery,
  useDeleteSpaceMutation,
  usePlatformLicensingPlansQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import Loading from '@/core/ui/loading/Loading';
import ListPage from '@/domain/platform/admin/components/ListPage';
import { SearchableTableItem, SearchableTableItemMapper } from '@/domain/platform/admin/components/SearchableTable';
import {
  AuthorizationPrivilege,
  LicensingCredentialBasedPlanType,
  SpaceVisibility,
} from '@/core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import SpaceListItem from './SpaceListItem';

export const SpaceList: FC = () => {
  const notify = useNotification();
  const { t } = useTranslation();

  const { data: spacesData, loading: loadingSpaces } = useAdminSpacesListQuery();
  const { data: platformLicensingData } = usePlatformLicensingPlansQuery();

  const allLicensePlans = platformLicensingData?.platform.licensingFramework.plans ?? [];
  const spaceLicensePlans = allLicensePlans.filter(
    plan =>
      plan.type === LicensingCredentialBasedPlanType.SpacePlan ||
      plan.type === LicensingCredentialBasedPlanType.SpaceFeatureFlag
  );
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
          const activeLicensingCredentialBasedCredentialTypes = space.subscriptions.map(
            subscription => subscription.name
          );
          const activeLicensePlanIds = platformLicensingData?.platform.licensingFramework.plans
            .filter(({ licenseCredential }) =>
              activeLicensingCredentialBasedCredentialTypes.includes(licenseCredential)
            )
            .map(({ id }) => id);

          return {
            ...SearchableTableItemMapper()(space),
            spaceId: space.id,
            nameId: space.nameID,
            visibility: space.visibility,
            activeLicensePlanIds,
            licensePlans: spaceLicensePlans,
          };
        }) ?? []
    );
  }, [spacesData]);

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
