import useCanEditSettings, { type UseCanEditSettingsResult } from './useCanEditSettings';

/**
 * Per-actor authorization predicate for the User vertical (research §7 /
 * FR-010). The User shell route boundary uses this to decide between
 * rendering the editable settings or redirecting to the public profile
 * (`/user/<slug>`).
 *
 * Aliases 096's existing `useCanEditSettings` — added in this spec under
 * the renamed identifier so consumption sites name the predicate's actor
 * vertical explicitly. The Org-side counterpart is
 * `useCanEditOrganizationSettings`.
 */
export type UseCanEditUserSettingsResult = UseCanEditSettingsResult;

const useCanEditUserSettings = (params: { profileUserId: string | undefined }): UseCanEditUserSettingsResult =>
  useCanEditSettings(params);

export default useCanEditUserSettings;
