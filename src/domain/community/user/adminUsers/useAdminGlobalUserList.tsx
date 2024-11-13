import { useMemo, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { SearchableTableItem } from '../../../platform/admin/components/SearchableTable';
import {
  refetchUserListQuery,
  useAssignLicensePlanToAccountMutation,
  useDeleteUserMutation,
  useRevokeLicensePlanFromAccountMutation,
  useUserListQuery,
} from '@core/apollo/generated/apollo-hooks';
import { useNotification } from '@core/ui/notifications/useNotification';
import usePaginatedQuery from '../../../shared/pagination/usePaginatedQuery';
import { LicensePlanType, UserListQuery, UserListQueryVariables } from '@core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import clearCacheForQuery from '@core/apollo/utils/clearCacheForQuery';
import { buildSettingsUrl } from '../../../../main/routing/urlBuilders';
import { ContributorLicensePlan } from '../../contributor/organization/adminOrganizations/useAdminGlobalOrganizationsList';

interface Provided {
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
}

const DEFAULT_PAGE_SIZE = 10;

interface UseAdminGlobalUserListOptions {
  skip?: boolean;
  pageSize?: number;
}

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

  const userList = useMemo(
    () =>
      (data?.usersPaginated.users ?? []).map<SearchableTableItem>(({ id, profile, email, account }) => ({
        id,
        accountId: account?.id,
        value: `${profile.displayName} (${email})`,
        url: buildSettingsUrl(profile.url),
        avatar: profile.visual,
        activeLicensePlanIds: data?.platform.licensing.plans
          .filter(({ licenseCredential }) =>
            account?.subscriptions.map(subscription => subscription.name).includes(licenseCredential)
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
        licensingId: data?.platform.licensing.id ?? '',
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
        licensingId: data?.platform.licensing.id ?? '',
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
      data?.platform.licensing.plans
        .filter(plan => plan.type === LicensePlanType.AccountPlan)
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
