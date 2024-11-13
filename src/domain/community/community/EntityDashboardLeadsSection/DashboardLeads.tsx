import React from 'react';
import PageContentBlockHeader from '@core/ui/content/PageContentBlockHeader';
import { Identifiable } from '@core/utils/Identifiable';

interface DashboardLeadsProps<T extends {}> {
  headerText: string;
  contributors: (T & Identifiable)[] | undefined;
  CardComponent: React.ComponentType<{ contributor: T }>;
}

const DashboardLeads = <T extends {}>({ headerText, contributors, CardComponent }: DashboardLeadsProps<T>) => {
  return (
    <>
      {headerText && <PageContentBlockHeader title={headerText} />}
      {contributors?.map(c => (
        <CardComponent key={c.id} contributor={c} {...c} />
      ))}
    </>
  );
};

export default DashboardLeads;
