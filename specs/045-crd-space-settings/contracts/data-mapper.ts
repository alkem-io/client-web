/**
 * Per-tab data-mapper contracts.
 *
 * Each `use<Tab>TabData()` hook is the sole integration point between Apollo
 * (generated hooks from `src/core/apollo/generated/apollo-hooks.ts`) and the
 * CRD presentational components. The hook returns props for the matching CRD
 * view, enriched with callbacks that fire the correct mutation.
 *
 * Implementations MUST live under `src/main/crdPages/topLevelPages/spaceSettings/<tab>/`.
 */

import type { AboutViewProps } from './tab-about';
import type { LayoutViewProps } from './tab-layout';
import type { CommunityViewProps } from './tab-community';
import type { SubspacesViewProps } from './tab-subspaces';
import type { TemplatesViewProps } from './tab-templates';
import type { StorageViewProps } from './tab-storage';
import type { SettingsViewProps } from './tab-settings';
import type { AccountViewProps } from './tab-account';

export type UseTabDataResult<Props> = {
  props: Props | null; // null while the initial query is loading
  loading: boolean;
  error: Error | null;
  isDirty: boolean;
  reset: () => void;
};

export type UseAboutTabData = (spaceId: string) => UseTabDataResult<AboutViewProps>;
export type UseLayoutTabData = (spaceId: string) => UseTabDataResult<LayoutViewProps>;
export type UseCommunityTabData = (spaceId: string) => UseTabDataResult<CommunityViewProps>;
export type UseSubspacesTabData = (spaceId: string) => UseTabDataResult<SubspacesViewProps>;
export type UseTemplatesTabData = (spaceId: string) => UseTabDataResult<TemplatesViewProps>;
export type UseStorageTabData = (spaceId: string) => UseTabDataResult<StorageViewProps>;
export type UseSettingsTabData = (spaceId: string) => UseTabDataResult<SettingsViewProps>;
export type UseAccountTabData = (spaceId: string) => UseTabDataResult<AccountViewProps>;

/**
 * Dirty-state guard. Single instance per settings page.
 * Enforces the "only one dirty tab at a time" invariant (Clarification Q2).
 */
export type UseDirtyTabGuard = () => {
  isDirty: boolean;
  markDirty: () => void;
  clearDirty: () => void;
  confirmSwitch: (next: import('./shell').TabId) => Promise<boolean>;
};
