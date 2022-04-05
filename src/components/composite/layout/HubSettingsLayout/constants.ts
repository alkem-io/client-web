import { TabDefinition } from '../../../core/PageTabs/PageTabs';

export enum HubSettingsSection {
  Profile = 'profile',
  Context = 'context',
  Community = 'community',
  Communications = 'communications',
  Authorization = 'authorization',
  Challenges = 'challenges',
  Templates = 'templates',
}

export const tabs: TabDefinition<HubSettingsSection>[] = [
  {
    section: HubSettingsSection.Profile,
    route: 'profile',
  },
  {
    section: HubSettingsSection.Context,
    route: 'context',
  },
  {
    section: HubSettingsSection.Community,
    route: 'community',
  },
  {
    section: HubSettingsSection.Communications,
    route: 'communications',
  },
  {
    section: HubSettingsSection.Authorization,
    route: 'authorization',
  },
  {
    section: HubSettingsSection.Challenges,
    route: 'challenges',
  },
];
