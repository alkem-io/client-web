import React from 'react';
import LeadUserCard, { LeadUserCardProps } from '../LeadCards/LeadUserCard';
import { Identifiable } from '../../../../core/utils/Identifiable';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';

interface EntityDashboardLeadsSectionProps {
  headerText: string;
  users: (LeadUserCardProps & Identifiable)[] | undefined;
}

const EntityDashboardLeadsSection = ({ headerText, users }: EntityDashboardLeadsSectionProps) => {
  return (
    <>
      <PageContentBlockHeader title={headerText} />
      {users?.map(user => (
        <LeadUserCard key={user.id} {...user} />
      ))}
    </>
  );
};

export default EntityDashboardLeadsSection;
