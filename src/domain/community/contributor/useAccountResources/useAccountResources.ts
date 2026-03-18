import { useMemo } from 'react';
import { useAccountResourcesInfoQuery } from '@/core/apollo/generated/apollo-hooks';

const useAccountResources = (accountId: string | undefined) => {
  const { data: accountData } = useAccountResourcesInfoQuery({
    variables: {
      accountId: accountId!,
    },
    skip: !accountId,
  });

  return useMemo(() => {
    if (!accountData || !accountData.lookup.account) {
      return undefined;
    }

    return accountData.lookup.account;
  }, [accountData]);
};

export default useAccountResources;
