export const managementData = {
  adminLvl: [
    {
      name: 'Authorization',
      buttons: [
        { description: 'Global admins', url: '/authorization/global-admin' },
        { description: 'Global community admins', url: '/authorization/global-admin-community' },
      ],
    },
    {
      name: 'Users',
      buttons: [{ description: 'Edit', url: '/users' }],
    },
    {
      name: 'Ecoverse community',
      buttons: [
        { description: 'Members', url: '/community/members' },
        { description: 'Groups', url: '/community/groups' },
        { description: 'Applications', url: '/community/applications' },
      ],
    },
    {
      name: 'Challenges',
      buttons: [
        { description: 'Manage', url: '/challenges' },
        { description: 'New', url: '/challenges/new' },
      ],
    },
    {
      name: 'Organizations',
      buttons: [
        { description: 'Manage', url: '/organizations' },
        { description: 'New', url: '/organizations/new' },
      ],
    },
  ],
  challengeLvl: [
    {
      name: 'Challenge info',
      buttons: [{ description: 'Edit', url: '/edit' }],
    },
    {
      name: 'Challenge community',
      buttons: [
        { description: 'Members', url: '/community/members' },
        { description: 'Groups', url: '/community/groups' },
        { description: 'Applications', url: '/community/applications' },
      ],
    },
    {
      name: 'Opportunities',
      buttons: [
        { description: 'Manage', url: '/opportunities' },
        { description: 'New', url: '/opportunities/new' },
      ],
    },
  ],
  opportunityLvl: [
    {
      name: 'Opportunity info',
      buttons: [{ description: 'Edit', url: '/edit' }],
    },
    {
      name: 'Opportunity community',
      buttons: [
        { description: 'Members', url: '/community/members' },
        { description: 'Groups', url: '/community/groups' },
        { description: 'Applications', url: '/community/applications' },
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
        { description: 'Manage', url: '/groups' },
        { description: 'New', url: '/groups/new' },
      ],
    },
  ],
};
