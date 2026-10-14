import { useAccountResourcesInfoQuery } from '@/core/apollo/generated/apollo-hooks';

const useAccountResources = (accountId: string | undefined) => {
  const { data: accountData, loading } = useAccountResourcesInfoQuery({
    variables: {
      accountId: accountId!,
    },
    skip: !accountId,
  });

  return {
    accountResources: accountData?.lookup.account ?? undefined,
    loading,
  };
};

export default useAccountResources;
