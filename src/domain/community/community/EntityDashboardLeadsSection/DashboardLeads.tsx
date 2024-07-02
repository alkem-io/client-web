import React from 'react';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { Identifiable } from '../../../../core/utils/Identifiable';

interface DashboardLeadsProps<T> {
  headerText: string;
  contributors: (T & Identifiable)[] | undefined;
  CardComponent: React.ComponentType<{ contributor: T }>;
}

const DashboardLeads = <T,>({ headerText, contributors, CardComponent }: DashboardLeadsProps<T>) => {
  return (
    <>
      {headerText && <PageContentBlockHeader title={headerText} />}
      {contributors?.map(c => (
        <CardComponent key={c.id} contributor={c} />
      ))}
    </>
  );
};

export default DashboardLeads;
