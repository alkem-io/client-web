import { useAccountResourcesInfoQuery } from '@/core/apollo/generated/apollo-hooks';

const useAccountResources = (accountId: string | undefined) => {
  const { data: accountData } = useAccountResourcesInfoQuery({
    variables: {
      accountId: accountId!,
    },
    skip: !accountId,
  });

  return (() => {
    if (!accountData || !accountData.lookup.account) {
      return undefined;
    }

    return accountData.lookup.account;
  })();
};

export default useAccountResources;
