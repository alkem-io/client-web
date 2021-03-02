export const managementData = {
  adminLvl: [
    {
      name: 'Users',
      buttons: [{ description: 'Edit', url: '/users' }],
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
  ],
  challengeLvl: [
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
  ],
  opportunityLvl: [
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
  ],
  organizationLvl: [
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
  ],
};
