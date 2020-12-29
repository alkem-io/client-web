import React, { FC } from 'react';
import { PageProps } from '../../pages';
import ManagementPageTemplate from './OrganizationPage';

const opportunityPageData = [
  {
    name: 'Opportunity info',
    buttons: [{ description: 'Edit', url: '/edit' }],
  },
  {
    name: 'Opportunity groups',
    buttons: [
      { description: 'Manage groups', url: '/groups' },
      { description: 'Create new', url: '/groups/new' },
    ],
  },
];

export const OpportunityPage: FC<PageProps> = ({ paths }) => (
  <ManagementPageTemplate data={opportunityPageData} paths={paths} />
);

export default OpportunityPage;
