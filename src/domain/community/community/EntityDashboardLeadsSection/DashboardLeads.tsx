import React from 'react';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import LeadContributorCard from '../LeadCards/LeadContributorCard';
import { ContributorViewProps } from '../EntityDashboardContributorsSection/Types';

interface DashboardLeadsProps {
  headerText: string;
  contributors: ContributorViewProps[] | undefined;
}

const DashboardLeads = ({ headerText, contributors }: DashboardLeadsProps) => {
  return (
    <>
      {headerText && <PageContentBlockHeader title={headerText} />}
      {contributors?.map(c => (
        <LeadContributorCard key={c.id} contributor={c} />
      ))}
    </>
  );
};

export default DashboardLeads;
