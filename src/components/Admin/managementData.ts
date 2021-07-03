import { AuthorizationCredential } from '../../types/graphql-schema';

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
        { description: 'Global admins', url: `/authorization/${AuthorizationCredential.GlobalAdmin}` },
        {
          description: 'Global community admins',
          url: `/authorization/${AuthorizationCredential.GlobalAdminCommunity}`,
        },
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
    {
      name: 'Authorization',
      buttons: [{ description: 'Ecoverse admins', url: `/authorization/${AuthorizationCredential.EcoverseAdmin}` }],
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
    {
      name: 'Authorization',
      buttons: [{ description: 'Challenge admins', url: `/authorization/${AuthorizationCredential.ChallengeAdmin}` }],
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
      name: 'Organization Context',
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
