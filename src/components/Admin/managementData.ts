export const managementData = {
  adminLvl: [
    {
      name: 'Ecoverses',
      buttons: [
        { description: 'Manage', url: '/ecoverses' },
        { description: 'New', url: '/ecoverses/new' },
      ],
    },
    {
      name: 'Users',
      buttons: [{ description: 'Manage', url: '/users' }],
    },
    {
      name: 'Organizations',
      buttons: [
        { description: 'Manage', url: '/organizations' },
        { description: 'New', url: '/organizations/new' },
      ],
    },
    {
      name: 'Authorization',
      buttons: [
        { description: 'Global admins', url: '/authorization/GlobalAdmin' },
        { description: 'Global community admins', url: '/authorization/GlobalAdminCommunity' },
      ],
    },
  ],
  ecoverseLvl: [
    {
      name: 'Info',
      buttons: [{ description: 'Edit', url: '/edit' }],
    },
    {
      name: 'Community',
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
  ],
  challengeLvl: [
    {
      name: 'Context',
      buttons: [{ description: 'Edit', url: '/edit' }],
    },
    {
      name: 'Community',
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
      name: 'Community',
      buttons: [
        { description: 'Members', url: '/community/members' },
        { description: 'Groups', url: '/community/groups' },
        { description: 'Applications', url: '/community/applications' },
      ],
    },
  ],
  organizationLvl: [
    {
      name: 'OrganizationContext',
      buttons: [{ description: 'Edit', url: '/edit' }],
    },
    {
      name: 'Groups',
      buttons: [
        { description: 'Manage', url: '/groups' },
        { description: 'New', url: '/groups/new' },
      ],
    },
  ],
};
