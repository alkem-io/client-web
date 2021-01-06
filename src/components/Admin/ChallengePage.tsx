import React, { FC } from 'react';
import { PageProps } from '../../pages';
import ManagementPageTemplate from './ManagementPageTemplate';

const challengePageData = [
  {
    name: 'Challenge info',
    buttons: [{ description: 'Edit', url: '/edit' }],
  },
  {
    name: 'Challenge groups',
    buttons: [
      { description: 'Manage groups', url: '/groups' },
      { description: 'Create new', url: '/groups/new' },
    ],
  },
  {
    name: 'Opportunities',
    buttons: [
      { description: 'Manage', url: '/opportunities' },
      { description: 'Create new', url: '/opportunities/new' },
    ],
  },
];

export const ChallengePage: FC<PageProps> = ({ paths }) => (
  <ManagementPageTemplate data={challengePageData} paths={paths} />
);

export default ChallengePage;
