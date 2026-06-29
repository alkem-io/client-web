import { useState } from 'react';
import {
  refetchUserAssistantSettingsQuery,
  useUpdateUserAssistantSettingsMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  buildAssistantUpdatePayload,
  type PlatformCapability,
  type StoredCapabilityToggle,
} from './assistantCapabilitiesMapper';

export type UseUserAssistantTabDataParams = {
  userId: string | undefined;
  capabilities: ReadonlyArray<PlatformCapability>;
  storedToggles: ReadonlyArray<StoredCapabilityToggle>;
};

export type UseUserAssistantTabDataResult = {
  /** Map<capabilityName, boolean> applied on top of stored values for instant feedback. */
  overrides: Map<string, boolean>;
  onToggle: (capabilityName: string, next: boolean) => Promise<void>;
};

/**
 * Per-tab data hook for the User → Settings → Assistant tab.
 *
 * Optimistic-overrides pattern (mirrors `useUserNotificationsTabData`):
 * 1. `onToggle` writes the override immediately → the UI flips.
 * 2. Fires `updateUserSettings({ assistant: { enabledCapabilities } })` with the
 *    FULL capability payload (every enumerated capability, resolved against the
 *    stored grant + the one toggled value) so previously-defaulted capabilities
 *    are materialised and nothing is lost.
 * 3. On success → refetch + clear that override (server now matches).
 * 4. On hard failure → rollback the override (UI snaps back) and re-throw so the
 *    integration page can surface an error toast.
 */
export const useUserAssistantTabData = ({
  userId,
  capabilities,
  storedToggles,
}: UseUserAssistantTabDataParams): UseUserAssistantTabDataResult => {
  const [overrides, setOverrides] = useState<Map<string, boolean>>(() => new Map());
  const [updateUserAssistantSettings] = useUpdateUserAssistantSettingsMutation();

  const clearOverride = (name: string) => {
    setOverrides(prev => {
      if (!prev.has(name)) return prev;
      const next = new Map(prev);
      next.delete(name);
      return next;
    });
  };

  const onToggle = async (capabilityName: string, next: boolean) => {
    if (!userId) return;
    // 1) Optimistic flip — and snapshot the full, up-to-date override map so the
    // mutation payload reflects every pending toggle, not just this one. Building
    // the payload from the freshest overrides (rather than the single toggle over
    // the render-snapshot stored values) keeps rapid successive toggles from
    // clobbering each other before the refetch settles.
    let mergedOverrides = new Map<string, boolean>();
    setOverrides(prev => {
      mergedOverrides = new Map(prev);
      mergedOverrides.set(capabilityName, next);
      return mergedOverrides;
    });
    try {
      const enabledCapabilities = buildAssistantUpdatePayload(capabilities, storedToggles, mergedOverrides);
      await updateUserAssistantSettings({
        variables: {
          settingsData: {
            userID: userId,
            settings: { assistant: { enabledCapabilities } },
          },
        },
        refetchQueries: [refetchUserAssistantSettingsQuery({ userId })],
        awaitRefetchQueries: true,
      });
      // 2) Success → drop the override (server now matches what the user wanted).
      clearOverride(capabilityName);
    } catch (err) {
      // 3) Hard failure → rollback + bubble for a toast.
      clearOverride(capabilityName);
      throw err;
    }
  };

  return { overrides, onToggle };
};

export default useUserAssistantTabData;
