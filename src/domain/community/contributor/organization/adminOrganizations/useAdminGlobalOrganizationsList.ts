import { useMemo, useState } from 'react';

import {
  refetchAdminGlobalOrganizationsListQuery,
  useAdminGlobalOrganizationsListQuery,
  useAdminOrganizationVerifyMutation,
  useAssignLicensePlanToAccountMutation,
  useDeleteOrganizationMutation,
  useRevokeLicensePlanFromAccountMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import usePaginatedQuery from '../../../../shared/pagination/usePaginatedQuery';
import { SearchableListItem } from '../../../../shared/components/SearchableList/SimpleSearchableTable';
import clearCacheForQuery from '../../../../../core/apollo/utils/clearCacheForQuery';
import { useTranslation } from 'react-i18next';
import { buildSettingsUrl } from '../../../../../main/routing/urlBuilders';
import { LicensePlanType } from '../../../../../core/apollo/generated/graphql-schema';

const PAGE_SIZE = 10;

enum OrgVerificationLifecycleStates {
  manuallyVerified = 'manuallyVerified',
}

export enum OrgVerificationLifecycleEvents {
  VERIFICATION_REQUEST = 'VERIFICATION_REQUEST',
  MANUALLY_VERIFY = 'MANUALLY_VERIFY',
  RESET = 'RESET',
}

export interface ContributorLicensePlan {
  id: string;
  name: string;
}

export const useAdminGlobalOrganizationsList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, ...paginationProvided } = usePaginatedQuery({
    useQuery: useAdminGlobalOrganizationsListQuery,
    variables: {
      filter: { displayName: searchTerm },
    },
    pageSize: PAGE_SIZE,
    getPageInfo: data => data?.organizationsPaginated.pageInfo,
  });

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

  const handleVerification = async (item: SearchableListItem) => {
    const orgFullData = data?.organizationsPaginated?.organization?.find(org => org.id === item.id);

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
      } catch (e) {
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
        licensingId: data?.platform.licensingFramework.id ?? '',
      },
      refetchQueries: [
        refetchAdminGlobalOrganizationsListQuery({
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
        licensingId: data?.platform.licensingFramework.id ?? '',
      },
      refetchQueries: [
        refetchAdminGlobalOrganizationsListQuery({
          first: PAGE_SIZE,
          filter: { displayName: searchTerm },
        }),
      ],
      onCompleted: () => notify(t('pages.admin.generic.sections.account.licenseUpdated'), 'success'),
    });
  };

  const organizations = useMemo<SearchableListItem[]>(
    () =>
      data?.organizationsPaginated.organization.map(org => ({
        id: org.id,
        accountId: org.account?.id,
        value: org.profile.displayName,
        url: buildSettingsUrl(org.profile.url),
        verified: org.verification.state === OrgVerificationLifecycleStates.manuallyVerified,
        avatar: org.profile.visual,
        activeLicensePlanIds: data?.platform.licensingFramework.plans
          .filter(({ licenseCredential }) =>
            org.account?.subscriptions.map(subscription => subscription.name).includes(licenseCredential)
          )
          .map(({ id }) => id),
      })) || [],
    [data]
  );

  const licensePlans = useMemo<ContributorLicensePlan[]>(
    () =>
      data?.platform.licensingFramework.plans
        .filter(plan => plan.type === LicensePlanType.AccountPlan)
        .map(licensePlan => ({
          id: licensePlan.id,
          name: licensePlan.name,
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
    ...paginationProvided,
  };
};

export default useAdminGlobalOrganizationsList;
