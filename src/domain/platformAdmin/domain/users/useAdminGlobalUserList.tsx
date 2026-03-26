import type { ApolloError } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchPlatformAdminUsersListQuery,
  useAssignLicensePlanToAccountMutation,
  useDeleteUserMutation,
  usePlatformAdminUsersListQuery,
  usePlatformLicensingPlansQuery,
  useRevokeLicensePlanFromAccountMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { LicensingCredentialBasedPlanType } from '@/core/apollo/generated/graphql-schema';
import clearCacheForQuery from '@/core/apollo/utils/clearCacheForQuery';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { SearchableTableItem } from '@/domain/platformAdmin/components/SearchableTable';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import type { ContributorLicensePlan } from '../../types/ContributorLicensePlan';

type Provided = {
  loading: boolean;
  deleting: boolean;
  error?: ApolloError;
  userList: SearchableTableItem[];
  onDelete: (item: SearchableTableItem) => void;
  fetchMore: (itemsNumber?: number) => Promise<void>;
  hasMore: boolean | undefined;
  pageSize: number;
  firstPageSize: number;
  searchTerm: string;
  licensePlans: ContributorLicensePlan[];
  assignLicensePlan: (accountId: string, planId: string) => Promise<void>;
  revokeLicensePlan: (accountId: string, planId: string) => Promise<void>;
  onSearchTermChange: (filterTerm: string) => void;
};

const DEFAULT_PAGE_SIZE = 10;

type UseAdminGlobalUserListOptions = {
  skip?: boolean;
  pageSize?: number;
};

const useAdminGlobalUserList = ({
  skip = false,
  pageSize = DEFAULT_PAGE_SIZE,
}: UseAdminGlobalUserListOptions = {}): Provided => {
  const { t } = useTranslation();
  const notify = useNotification();

  const [searchTerm, setSearchTerm] = useState('');

  // Call the query hook directly instead of passing it to usePaginatedQuery
  const {
    data,
    loading,
    error,
    fetchMore: fetchMoreRaw,
  } = usePlatformAdminUsersListQuery({
    variables: {
      first: pageSize,
      filter: { firstName: searchTerm, lastName: searchTerm, email: searchTerm },
    },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    skip,
  });

  const pageInfo = data?.platformAdmin.users.pageInfo;
  const hasMore = pageInfo?.hasNextPage ?? false;

  const fetchMore = async (itemsNumber = pageSize) => {
    if (!data) {
      return;
    }

    await fetchMoreRaw({
      variables: {
        first: itemsNumber,
        after: pageInfo?.endCursor,
        filter: { firstName: searchTerm, lastName: searchTerm, email: searchTerm },
      },
    });
  };

  const platformLicensePlans = usePlatformLicensingPlansQuery();

  const userList = (data?.platformAdmin.users.users ?? []).map<SearchableTableItem>(
    ({ id, profile, email, account }) => ({
      id,
      accountId: account?.id,
      value: `${profile?.displayName ?? ''} (${email})`,
      url: buildSettingsUrl(profile?.url ?? ''),
      avatar: profile?.visual,
      activeLicensePlanIds: platformLicensePlans?.data?.platform.licensingFramework.plans
        .filter(({ licenseCredential }) =>
          account?.subscriptions.map(subscription => subscription.name).includes(licenseCredential)
        )
        .map(({ id }) => id),
    })
  );

  const [deleteUser, { loading: deleting }] = useDeleteUserMutation({
    update: cache => clearCacheForQuery(cache, 'usersPaginated'),
    onCompleted: () => notify(t('pages.admin.users.notifications.user-removed'), 'success'),
  });

  const onDelete = (item: SearchableTableItem) => {
    deleteUser({
      variables: {
        input: {
          ID: item.id,
        },
      },
    });
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
        refetchPlatformAdminUsersListQuery({
          first: pageSize,
          filter: { firstName: searchTerm, lastName: searchTerm, email: searchTerm },
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
        licensingId: platformLicensePlans?.data?.platform.licensingFramework.id ?? '',
      },
      refetchQueries: [
        refetchPlatformAdminUsersListQuery({
          first: pageSize,
          filter: { firstName: searchTerm, lastName: searchTerm, email: searchTerm },
        }),
      ],
      onCompleted: () => notify(t('pages.admin.generic.sections.account.licenseUpdated'), 'success'),
    });
  };

  const licensePlans =
    platformLicensePlans?.data?.platform.licensingFramework.plans
      .filter(plan => plan.type === LicensingCredentialBasedPlanType.AccountPlan)
      .map(licensePlan => ({
        id: licensePlan.id,
        name: licensePlan.name,
        sortOrder: licensePlan.sortOrder,
      })) || [];

  return {
    userList,
    loading,
    deleting,
    error,
    onDelete,
    fetchMore,
    hasMore,
    pageSize,
    firstPageSize: pageSize,
    searchTerm,
    licensePlans,
    assignLicensePlan,
    revokeLicensePlan,
    onSearchTermChange: setSearchTerm,
  };
};

export default useAdminGlobalUserList;
