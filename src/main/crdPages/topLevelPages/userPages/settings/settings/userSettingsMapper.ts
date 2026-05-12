import type { UserSettingsQuery } from '@/core/apollo/generated/graphql-schema';

export type UserSettingsMappedData = {
  /** `settings.communication.allowOtherUsersToSendMessages`. */
  allowOtherUsersToSendMessages: boolean;
};

/**
 * Pure mapper: extracts the User Settings tab's editable values from
 * `useUserSettingsQuery`. Communication & Privacy is the only server-side
 * setting on this tab — the Design System toggle reads/writes the
 * viewer's own browser localStorage and is NOT a server-stored attribute
 * (FR-073).
 */
export const mapUserSettings = (data: UserSettingsQuery | undefined): UserSettingsMappedData => {
  const settings = data?.lookup.user?.settings;
  return {
    allowOtherUsersToSendMessages: settings?.communication?.allowOtherUsersToSendMessages ?? false,
  };
};

/** Storage key for the CRD design-system toggle. Mirrors `useCrdEnabled.ts`. */
export const CRD_STORAGE_KEY = 'alkemio-crd-enabled';

export const readCrdEnabledLocally = (): boolean => {
  try {
    return localStorage.getItem(CRD_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

export const writeCrdEnabledLocally = (next: boolean): void => {
  try {
    if (next) {
      localStorage.setItem(CRD_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(CRD_STORAGE_KEY);
    }
  } catch {
    // Some browsers (private mode, storage quota) reject writes silently.
    // The toggle is a UI-only convenience; failure here is non-fatal.
  }
};
