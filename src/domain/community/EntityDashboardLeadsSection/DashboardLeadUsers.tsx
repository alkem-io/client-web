import React from 'react';
import { SectionSpacer } from '../../../components/core/Section/Section';
import SectionHeader from '../../../components/core/Section/SectionHeader';
import LeadUserCard, { LeadUserCardProps } from '../LeadUserCard/LeadUserCard';

interface EntityDashboardLeadsSectionProps {
  headerText: string;
  users: LeadUserCardProps[] | undefined;
}

const EntityDashboardLeadsSection = ({ headerText, users }: EntityDashboardLeadsSectionProps) => {
  return (
    <>
      <SectionHeader text={headerText} />
      <SectionSpacer />
      {users?.map(user => (
        <LeadUserCard {...user} />
      ))}
    </>
  );
};

export default EntityDashboardLeadsSection;
