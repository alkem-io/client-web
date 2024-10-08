import { useMemo } from 'react';
import { SpaceHostedItem } from '../../../journey/utils/SpaceHostedItem';
import { RoleType } from '../constants/RoleType';

const hasRole = (contribution: SpaceHostedItem, roles: RoleType[]) =>
  roles.some(role => contribution.roles?.includes(role));

const useFilteredMemberships = (contributions: SpaceHostedItem[], leadRoles: RoleType[]) => {
  return useMemo(() => {
    const filteredMemberships: SpaceHostedItem[] = [];
    const remainingMemberships: SpaceHostedItem[] = [];

    contributions.forEach((contribution: SpaceHostedItem) => {
      if (hasRole(contribution, leadRoles)) {
        filteredMemberships.push(contribution);
      } else {
        remainingMemberships.push(contribution);
      }
    });

    return [filteredMemberships, remainingMemberships];
  }, [contributions]);
};

export default useFilteredMemberships;
