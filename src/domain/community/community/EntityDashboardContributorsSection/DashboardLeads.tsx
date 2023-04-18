import React, { useMemo } from 'react';
import { WithId } from '../../../../types/WithId';
import { ContributorCardProps } from '../../contributor/ContributorCardSquare/ContributorCardSquare';
import LeadUserCard, { LeadUserCardProps } from '../LeadUserCard/LeadUserCard';
import { Identifiable } from '../../../shared/types/Identifiable';

interface DashboardLeadsProps {
  users: WithId<ContributorCardProps>[] | undefined;
}

const DashboardLeads = ({ users }: DashboardLeadsProps) => {
  // TODO re-mapping to be removed when addressing https://github.com/alkem-io/client-web/issues/2819
  const remappedUsers = useMemo<(LeadUserCardProps & Identifiable)[] | undefined>(() => {
    return users?.map(({ displayName, avatar, url, tooltip, ...user }) => ({
      fullName: displayName,
      avatarUrl: avatar,
      userUrl: url,
      country: tooltip?.country,
      city: tooltip?.city,
      tags: tooltip?.tags,
      ...user,
    }));
  }, [users]);

  return (
    <>
      {remappedUsers?.map(user => (
        <LeadUserCard key={user.id} {...user} />
      ))}
    </>
  );
};

export default DashboardLeads;
