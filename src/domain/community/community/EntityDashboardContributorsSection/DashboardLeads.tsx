import React, { useMemo } from 'react';
import { WithId } from '../../../../types/WithId';
import { ContributorCardProps } from '../../../../common/components/composite/common/cards/ContributorCard/ContributorCard';
import SectionHeader from '../../../shared/components/Section/SectionHeader';
import withOptionalCount from '../../../shared/utils/withOptionalCount';
import { SectionSpacer } from '../../../shared/components/Section/Section';
import LeadUserCard, { LeadUserCardProps } from '../LeadUserCard/LeadUserCard';
import { Identifiable } from '../../../shared/types/Identifiable';

interface DashboardLeadsProps {
  headerText: string;
  users: WithId<ContributorCardProps>[] | undefined;
  usersCount: number | undefined;
}

const DashboardLeads = ({ users, usersCount, headerText }: DashboardLeadsProps) => {
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
      <SectionHeader text={withOptionalCount(headerText, usersCount)} />
      <SectionSpacer />
      {remappedUsers?.map(user => (
        <LeadUserCard key={user.id} {...user} />
      ))}
    </>
  );
};

export default DashboardLeads;
