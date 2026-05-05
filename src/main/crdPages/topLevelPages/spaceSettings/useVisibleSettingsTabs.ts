import {
  Bookmark,
  HardDrive,
  Info,
  Layers,
  LayoutGrid,
  Megaphone,
  Settings as SettingsIcon,
  UserCircle,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SpaceSettingsTabDescriptor } from '@/crd/components/space/settings/SpaceSettingsTabStrip';
import type { SettingsScopeLevel } from './useSettingsScope';
import { SPACE_SETTINGS_TAB_IDS, type SpaceSettingsTabId } from './useSpaceSettingsTab';

/**
 * Tabs visible at each space level — mirrors the legacy MUI configuration in
 * `src/domain/spaceAdmin/routing/SpaceAdminRouteL{0,1,2}.tsx`.
 *
 * - L0 (top-level space): all 9 tabs.
 * - L1 (subspace): no Templates / Storage / Account.
 * - L2 (sub-subspace): also no Subspaces (cannot have L3 children).
 */
const HIDDEN_AT_L1 = new Set<SpaceSettingsTabId>(['templates', 'storage', 'account']);
const HIDDEN_AT_L2 = new Set<SpaceSettingsTabId>(['templates', 'storage', 'account', 'subspaces']);

export function getVisibleSettingsTabs(level: SettingsScopeLevel): readonly SpaceSettingsTabId[] {
  if (level === 'L1') {
    return SPACE_SETTINGS_TAB_IDS.filter(id => !HIDDEN_AT_L1.has(id));
  }
  if (level === 'L2') {
    return SPACE_SETTINGS_TAB_IDS.filter(id => !HIDDEN_AT_L2.has(id));
  }
  return SPACE_SETTINGS_TAB_IDS;
}

const TAB_ICONS: Record<SpaceSettingsTabId, SpaceSettingsTabDescriptor<SpaceSettingsTabId>['icon']> = {
  about: Info,
  layout: LayoutGrid,
  community: Users,
  updates: Megaphone,
  subspaces: Layers,
  templates: Bookmark,
  storage: HardDrive,
  settings: SettingsIcon,
  account: UserCircle,
};

const TAB_DEFAULT_LABELS: Record<SpaceSettingsTabId, string> = {
  about: 'About',
  layout: 'Layout',
  community: 'Community',
  updates: 'Updates',
  subspaces: 'Subspaces',
  templates: 'Templates',
  storage: 'Storage',
  settings: 'Settings',
  account: 'Account',
};

/**
 * Returns the settings-tab descriptors visible at the given space level,
 * with translated labels and standard icons.
 */
export function useSettingsTabDescriptors(
  level: SettingsScopeLevel
): ReadonlyArray<SpaceSettingsTabDescriptor<SpaceSettingsTabId>> {
  const { t } = useTranslation('crd-spaceSettings');
  const visible = getVisibleSettingsTabs(level);
  return visible.map(id => ({
    id,
    label: t(`tabs.${id}`, { defaultValue: TAB_DEFAULT_LABELS[id] }),
    icon: TAB_ICONS[id],
  }));
}
