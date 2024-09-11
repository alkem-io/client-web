import { useMemo, useState } from 'react';

import {
  useAdminGlobalOrganizationsListQuery,
  useAdminOrganizationVerifyMutation,
  useDeleteOrganizationMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import usePaginatedQuery from '../../../../shared/pagination/usePaginatedQuery';
import { SearchableListItem } from '../../../../shared/components/SearchableList/SimpleSearchableTable';
import clearCacheForQuery from '../../../../../core/apollo/utils/clearCacheForQuery';
import { useTranslation } from 'react-i18next';
import { buildSettingsUrl } from '../../../../../main/routing/urlBuilders';

const PAGE_SIZE = 10;

enum OrgVerificationLifecycleStates {
  manuallyVerified = 'manuallyVerified',
}

enum OrgVerificationLifecycleEvents {
  VERIFICATION_REQUEST = 'VERIFICATION_REQUEST',
  MANUALLY_VERIFY = 'MANUALLY_VERIFY',
  RESET = 'RESET',
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

    if (orgFullData.verification.lifecycle.state === OrgVerificationLifecycleStates.manuallyVerified) {
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
        console.log('VERIFICATION_REQUEST event failed: ', e);
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

  const organizations = useMemo<SearchableListItem[]>(
    () =>
      data?.organizationsPaginated.organization.map(org => ({
        id: org.id,
        value: org.profile.displayName,
        url: buildSettingsUrl(org.profile.url),
        verified: org.verification.lifecycle.state === OrgVerificationLifecycleStates.manuallyVerified,
      })) || [],
    [data]
  );

  return {
    organizations,
    searchTerm,
    onSearchTermChange: setSearchTerm,
    onDelete: handleDelete,
    handleVerification: handleVerification,
    ...paginationProvided,
  };
};

export default useAdminGlobalOrganizationsList;
