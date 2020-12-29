import React, { FC } from 'react';
import { PageProps } from '../../pages';

import ManagementPageTemplate from './ManagementPageTemplate';

const adminPageData = [
  {
    name: 'Users',
    buttons: [
      { description: 'Edit', url: '/users' },
      { description: 'Create new', url: '/users/new' },
    ],
  },
  {
    name: 'Ecoverse groups',
    buttons: [
      { description: 'Manage', url: '/groups' },
      { description: 'Create New', url: '/groups/new' },
    ],
  },
  {
    name: 'Challenges',
    buttons: [
      { description: 'Manage', url: '/challenges' },
      { description: 'Create New', url: '/challenges/new' },
    ],
  },
  {
    name: 'Organizations',
    buttons: [
      { description: 'Manage', url: '/organizations' },
      { description: 'Create New', url: '/organizations/new' },
    ],
  },
];

export const AdminPage: FC<PageProps> = ({ paths }) => <ManagementPageTemplate data={adminPageData} paths={paths} />;

export default AdminPage;
