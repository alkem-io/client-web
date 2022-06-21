import React from 'react';
import { SectionSpacer } from '../../shared/components/Section/Section';
import SectionHeader from '../../shared/components/Section/SectionHeader';
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
