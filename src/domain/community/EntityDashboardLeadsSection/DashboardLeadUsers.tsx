import React from 'react';
import { SectionSpacer } from '../../shared/components/Section/Section';
import SectionHeader from '../../shared/components/Section/SectionHeader';
import LeadUserCard, { LeadUserCardProps } from '../LeadUserCard/LeadUserCard';
import { Identifiable } from '../../shared/types/Identifiable';

interface EntityDashboardLeadsSectionProps {
  headerText: string;
  users: (LeadUserCardProps & Identifiable)[] | undefined;
}

const EntityDashboardLeadsSection = ({ headerText, users }: EntityDashboardLeadsSectionProps) => {
  return (
    <>
      <SectionHeader text={headerText} />
      <SectionSpacer />
      {users?.map(user => (
        <LeadUserCard key={user.id} {...user} />
      ))}
    </>
  );
};

export default EntityDashboardLeadsSection;
