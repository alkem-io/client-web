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
  const remappedUsers = useMemo<(LeadUserCardProps & Identifiable)[] | undefined>(() => {
    return users?.map(({ displayName, avatar, url, ...user }) => ({
      fullName: displayName,
      avatarUrl: avatar,
      userUrl: url,
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
