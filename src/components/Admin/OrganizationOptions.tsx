import React, { FC } from 'react';
import { PageProps } from '../../pages';
import ManagementPageTemplate from './ManagementPageTemplate';

const organizationPageData = [
  {
    name: 'Organization info',
    buttons: [{ description: 'Edit', url: '/edit' }],
  },
  {
    name: 'Organization groups',
    buttons: [
      { description: 'Manage groups', url: '/groups' },
      { description: 'Create new', url: '/groups/new' },
    ],
  },
];

export const OrganizationOptions: FC<PageProps> = ({ paths }) => (
  <ManagementPageTemplate data={organizationPageData} paths={paths} />
);

export default OrganizationOptions;
