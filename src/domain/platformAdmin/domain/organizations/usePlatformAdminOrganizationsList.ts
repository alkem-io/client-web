import { useCallback, useMemo, useState } from 'react';

import {
  refetchPlatformAdminOrganizationsListQuery,
  usePlatformAdminOrganizationsListQuery,
  useAdminOrganizationVerifyMutation,
  useAssignLicensePlanToAccountMutation,
  useDeleteOrganizationMutation,
  usePlatformLicensingPlansQuery,
  useRevokeLicensePlanFromAccountMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { SearchableListItem } from '@/domain/shared/components/SearchableList/SimpleSearchableTable';
import clearCacheForQuery from '@/core/apollo/utils/clearCacheForQuery';
import { useTranslation } from 'react-i18next';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import { LicensingCredentialBasedPlanType } from '@/core/apollo/generated/graphql-schema';
import { ContributorLicensePlan } from '../../types/ContributorLicensePlan';
import {
  OrgVerificationLifecycleEvents,
  OrgVerificationLifecycleStates,
} from '@/domain/community/organization/model/OrganizationVerification';

const PAGE_SIZE = 10;

export const usePlatformAdminOrganizationsList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Call the query hook directly instead of passing it to usePaginatedQuery
  const {
    data,
    loading,
    fetchMore: fetchMoreRaw,
    error,
  } = usePlatformAdminOrganizationsListQuery({
    variables: {
      first: PAGE_SIZE,
      filter: { displayName: searchTerm },
    },
  });

  const pageInfo = data?.platformAdmin.organizations.pageInfo;
  const hasMore = pageInfo?.hasNextPage ?? false;

  const fetchMore = useCallback(
    async (itemsNumber = PAGE_SIZE) => {
      if (!data) {
        return;
      }

      await fetchMoreRaw({
        variables: {
          first: itemsNumber,
          after: pageInfo?.endCursor,
          filter: { displayName: searchTerm },
        },
      });
    },
    [data, fetchMoreRaw, pageInfo?.endCursor, searchTerm]
  );

  const { t } = useTranslation();
  const notify = useNotification();

  const [deleteOrganization] = useDeleteOrganizationMutation({
    update: cache => clearCacheForQuery(cache, 'organizationsPaginated'),
    onCompleted: () => notify(t('pages.admin.organization.notifications.organization-removed'), 'success'),
  });

  const handleDelete = (item: SearchableListItem) =>
    deleteOrganization({
      variables: {
        input: {
          ID: item.id,
        },
      },
    });

  const [verifyOrg] = useAdminOrganizationVerifyMutation();
  const platformLicensePlans = usePlatformLicensingPlansQuery();

  const handleVerification = async (item: SearchableListItem) => {
    const orgFullData = data?.platformAdmin.organizations?.organization?.find(org => org.id === item.id);

    if (!orgFullData) {
      return;
    }

    if (orgFullData.verification.state === OrgVerificationLifecycleStates.manuallyVerified) {
      await verifyOrg({
        variables: {
          input: {
            eventName: OrgVerificationLifecycleEvents.RESET,
            organizationVerificationID: orgFullData.verification.id,
          },
        },
      });
    } else {
      // in case the VERIFICATION_REQUEST is not available, try to complete with MANUALLY_VERIFY
      try {
        await verifyOrg({
          variables: {
            input: {
              eventName: OrgVerificationLifecycleEvents.VERIFICATION_REQUEST,
              organizationVerificationID: orgFullData.verification.id,
            },
          },
        });
      } catch (_error) {
        // ignore errors if the verification_request fails we still try to manually verify
      }

      await verifyOrg({
        variables: {
          input: {
            eventName: OrgVerificationLifecycleEvents.MANUALLY_VERIFY,
            organizationVerificationID: orgFullData.verification.id,
          },
        },
      });
    }
  };

  const [assignLicense] = useAssignLicensePlanToAccountMutation();
  const assignLicensePlan = async (accountId: string, licensePlanId: string) => {
    await assignLicense({
      variables: {
        accountId,
        licensePlanId,
        licensingId: platformLicensePlans?.data?.platform.licensingFramework.id ?? '',
      },
      refetchQueries: [
        refetchPlatformAdminOrganizationsListQuery({
          first: PAGE_SIZE,
          filter: { displayName: searchTerm },
        }),
      ],
      onCompleted: () => notify(t('pages.admin.generic.sections.account.licenseUpdated'), 'success'),
    });
  };

  const [revokeLicense] = useRevokeLicensePlanFromAccountMutation();
  const revokeLicensePlan = async (accountId: string, licensePlanId: string) => {
    await revokeLicense({
      variables: {
        accountId,
        licensePlanId,
        licensingId: platformLicensePlans.data?.platform.licensingFramework.id ?? '',
      },
      refetchQueries: [
        refetchPlatformAdminOrganizationsListQuery({
          first: PAGE_SIZE,
          filter: { displayName: searchTerm },
        }),
      ],
      onCompleted: () => notify(t('pages.admin.generic.sections.account.licenseUpdated'), 'success'),
    });
  };

  const organizations = useMemo<SearchableListItem[]>(
    () =>
      data?.platformAdmin.organizations?.organization.map(org => ({
        id: org.id,
        accountId: org.account?.id,
        value: org.profile.displayName,
        url: buildSettingsUrl(org.profile.url),
        verified: org.verification.state === OrgVerificationLifecycleStates.manuallyVerified,
        avatar: org.profile.visual,
        activeLicensePlanIds: platformLicensePlans.data?.platform.licensingFramework.plans
          .filter(({ licenseCredential }) =>
            org.account?.subscriptions.map(subscription => subscription.name).includes(licenseCredential)
          )
          .map(({ id }) => id),
      })) || [],
    [data]
  );

  const licensePlans = useMemo<ContributorLicensePlan[]>(
    () =>
      platformLicensePlans.data?.platform.licensingFramework.plans
        .filter(plan => plan.type === LicensingCredentialBasedPlanType.AccountPlan)
        .map(licensePlan => ({
          id: licensePlan.id,
          name: licensePlan.name,
          sortOrder: licensePlan.sortOrder,
        })) || [],
    [data]
  );

  return {
    organizations,
    searchTerm,
    onSearchTermChange: setSearchTerm,
    onDelete: handleDelete,
    handleVerification,
    licensePlans,
    assignLicensePlan,
    revokeLicensePlan,
    loading,
    error,
    fetchMore,
    hasMore,
    pageSize: PAGE_SIZE,
    firstPageSize: PAGE_SIZE,
  };
};

export default usePlatformAdminOrganizationsList;
