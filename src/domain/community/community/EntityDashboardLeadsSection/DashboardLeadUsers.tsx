import React from 'react';
import LeadUserCard, { LeadUserCardProps } from '../LeadCards/LeadUserCard';
import { Identifiable } from '../../../shared/types/Identifiable';
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
