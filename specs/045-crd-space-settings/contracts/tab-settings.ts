import type { SaveBarState } from './shell';

export type SpacePrivacy = 'public' | 'private';

export type SettingsViewProps = {
  privacy: SpacePrivacy;
  hostOrganizationName: string | null;
  allowGuestVisitors: boolean;
  allowMemberCreatedSubspaces: boolean;
  showOnExplorer: boolean;
  saveBar: SaveBarState;
  onPrivacyChange: (next: SpacePrivacy) => void;
  onToggle: (
    key: 'allowGuestVisitors' | 'allowMemberCreatedSubspaces' | 'showOnExplorer',
    next: boolean
  ) => void;
  onSave: () => void;
  onReset: () => void;
};
