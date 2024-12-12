import { useMemo, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { SearchableTableItem } from '@/domain/platform/admin/components/SearchableTable';
import {
  refetchUserListQuery,
  useAssignLicensePlanToAccountMutation,
  useDeleteUserMutation,
  usePlatformLicensingPlansQuery,
  useRevokeLicensePlanFromAccountMutation,
  useUserListQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import usePaginatedQuery from '@/domain/shared/pagination/usePaginatedQuery';
import {
  LicensingCredentialBasedPlanType,
  UserListQuery,
  UserListQueryVariables,
} from '@/core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import clearCacheForQuery from '@/core/apollo/utils/clearCacheForQuery';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import { ContributorLicensePlan } from '@/domain/community/contributor/organization/adminOrganizations/useAdminGlobalOrganizationsList';

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

  const {
    data,
    loading,
    error,
    fetchMore,
    hasMore,
    pageSize: actualPageSize,
    firstPageSize,
  } = usePaginatedQuery<UserListQuery, UserListQueryVariables>({
    useQuery: useUserListQuery,
    options: {
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
      skip,
    },
    variables: {
      filter: { firstName: searchTerm, lastName: searchTerm, email: searchTerm },
    },
    pageSize,
    getPageInfo: result => result.usersPaginated.pageInfo,
  });

  const platformLicensePlans = usePlatformLicensingPlansQuery();

  const userList = useMemo(
    () =>
      (data?.usersPaginated.users ?? []).map<SearchableTableItem>(({ id, profile, email, account }) => ({
        id,
        accountId: account?.id,
        value: `${profile.displayName} (${email})`,
        url: buildSettingsUrl(profile.url),
        avatar: profile.visual,
        activeLicensePlanIds: platformLicensePlans?.data?.platform.licensingFramework.plans
          .filter(({ LicensingCredentialBasedCredentialType }) =>
            account?.subscriptions
              .map(subscription => subscription.name)
              .includes(LicensingCredentialBasedCredentialType)
          )
          .map(({ id }) => id),
      })),
    [data]
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
        refetchUserListQuery({
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
        refetchUserListQuery({
          first: pageSize,
          filter: { firstName: searchTerm, lastName: searchTerm, email: searchTerm },
        }),
      ],
      onCompleted: () => notify(t('pages.admin.generic.sections.account.licenseUpdated'), 'success'),
    });
  };

  const licensePlans = useMemo<ContributorLicensePlan[]>(
    () =>
      platformLicensePlans?.data?.platform.licensingFramework.plans
        .filter(plan => plan.type === LicensingCredentialBasedPlanType.AccountPlan)
        .map(licensePlan => ({
          id: licensePlan.id,
          name: licensePlan.name,
        })) || [],
    [data]
  );

  return {
    userList,
    loading,
    deleting,
    error,
    onDelete,
    fetchMore,
    hasMore,
    pageSize: actualPageSize,
    firstPageSize,
    searchTerm,
    licensePlans,
    assignLicensePlan,
    revokeLicensePlan,
    onSearchTermChange: setSearchTerm,
  };
};

export default useAdminGlobalUserList;
