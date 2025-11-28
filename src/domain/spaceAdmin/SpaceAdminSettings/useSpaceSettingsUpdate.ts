import { useOptimistic, useTransition, useCallback } from 'react';
import { useUpdateSpaceSettingsMutation } from '@/core/apollo/generated/apollo-hooks';
import { CommunityMembershipPolicy, SpacePrivacyMode } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useTranslation } from 'react-i18next';
import { error as logError } from '@/core/logging/sentry/log';
import { defaultSpaceSettings } from './SpaceDefaultSettings';
import {
  SpaceSettingsCollaboration,
  SpaceSettingsMembership,
  SpaceSettingsPrivacy,
} from '@/domain/space/settings/SpaceSettingsModel';

export interface SpaceSettingsUpdateParams {
  privacyMode?: SpacePrivacyMode;
  membershipPolicy?: CommunityMembershipPolicy;
  allowSubspaceAdminsToInviteMembers?: boolean;
  allowEventsFromSubspaces?: boolean;
  allowMembersToCreateSubspaces?: boolean;
  allowMembersToCreateCallouts?: boolean;
  allowMembersToVideoCall?: boolean;
  inheritMembershipRights?: boolean;
  allowGuestContributions?: boolean;
  hostOrganizationTrusted?: boolean;
  collaborationSettings?: Partial<SpaceSettingsCollaboration>;
  showNotification?: boolean;
  allowPlatformSupportAsAdmin?: boolean;
}

export interface UseSpaceSettingsUpdateProps {
  spaceId: string;
  currentSettings: {
    privacy?: Partial<SpaceSettingsPrivacy>;
    membership?: Partial<SpaceSettingsMembership>;
    collaboration?: Partial<SpaceSettingsCollaboration>;
    hostOrganizationTrusted?: boolean;
  };
  hostId?: string;
}

export const useSpaceSettingsUpdate = ({ spaceId, currentSettings, hostId }: UseSpaceSettingsUpdateProps) => {
  const { t } = useTranslation();
  const notify = useNotification();

  const [updateSpaceSettings] = useUpdateSpaceSettingsMutation({
    onError: error => {
      logError(error);
      notify(t('pages.admin.space.settings.updateFailed'), 'error');
    },
  });

  // Optimistic state for immediate UI feedback
  const [optimisticSettings, setOptimisticSettings] = useOptimistic(
    currentSettings,
    (state, newSettings: Partial<typeof currentSettings>) => ({
      ...state,
      ...newSettings,
      privacy: newSettings.privacy ? { ...state?.privacy, ...newSettings.privacy } : state?.privacy,
      membership: newSettings.membership ? { ...state?.membership, ...newSettings.membership } : state?.membership,
      collaboration: newSettings.collaboration
        ? { ...state?.collaboration, ...newSettings.collaboration }
        : state?.collaboration,
    })
  );

  const [isPending, startTransition] = useTransition();

  const updateSettings = useCallback(
    async (params: SpaceSettingsUpdateParams) => {
      const {
        privacyMode = currentSettings?.privacy?.mode ?? defaultSpaceSettings.privacy.mode,
        membershipPolicy = currentSettings?.membership?.policy ?? defaultSpaceSettings.membership.policy,
        allowSubspaceAdminsToInviteMembers = currentSettings?.membership?.allowSubspaceAdminsToInviteMembers ??
          defaultSpaceSettings.membership.allowSubspaceAdminsToInviteMembers,
        allowEventsFromSubspaces = currentSettings?.collaboration?.allowEventsFromSubspaces ??
          defaultSpaceSettings.collaboration.allowEventsFromSubspaces,
        allowMembersToCreateSubspaces = currentSettings?.collaboration?.allowMembersToCreateSubspaces ??
          defaultSpaceSettings.collaboration.allowMembersToCreateSubspaces,
        allowMembersToCreateCallouts = currentSettings?.collaboration?.allowMembersToCreateCallouts ??
          defaultSpaceSettings.collaboration.allowMembersToCreateCallouts,
        allowMembersToVideoCall = currentSettings?.collaboration?.allowMembersToVideoCall ??
          defaultSpaceSettings.collaboration.allowMembersToVideoCall,
        inheritMembershipRights = currentSettings?.collaboration?.inheritMembershipRights ??
          defaultSpaceSettings.collaboration.inheritMembershipRights,
        allowGuestContributions = currentSettings?.collaboration?.allowGuestContributions ??
          defaultSpaceSettings.collaboration.allowGuestContributions,
        hostOrganizationTrusted = currentSettings.hostOrganizationTrusted ??
          defaultSpaceSettings.membership.hostOrganizationTrusted,
        collaborationSettings = currentSettings.collaboration ?? defaultSpaceSettings.collaboration,
        showNotification = true,
        allowPlatformSupportAsAdmin = currentSettings.privacy?.allowPlatformSupportAsAdmin ??
          defaultSpaceSettings.privacy.allowPlatformSupportAsAdmin,
      } = params;

      // Prepare trusted organizations
      const trustedOrganizations = [...(currentSettings?.membership?.trustedOrganizations ?? [])];
      if (hostOrganizationTrusted && hostId) {
        if (!trustedOrganizations.includes(hostId)) {
          trustedOrganizations.push(hostId);
        }
      } else {
        trustedOrganizations.splice(0, trustedOrganizations.length);
      }

      // Prepare settings variable
      const settingsVariable = {
        privacy: {
          mode: privacyMode,
          allowPlatformSupportAsAdmin,
        },
        membership: {
          policy: membershipPolicy,
          trustedOrganizations,
          allowSubspaceAdminsToInviteMembers,
        },
        collaboration: {
          ...currentSettings.collaboration,
          ...collaborationSettings,
          allowEventsFromSubspaces,
          allowMembersToCreateSubspaces,
          allowMembersToCreateCallouts,
          allowMembersToVideoCall,
          inheritMembershipRights,
          allowGuestContributions,
        } as SpaceSettingsCollaboration,
      };

      // Create the optimistic state update action
      const updateAction = async () => {
        setOptimisticSettings({
          privacy: settingsVariable.privacy,
          membership: settingsVariable.membership,
          collaboration: settingsVariable.collaboration,
        });

        await updateSpaceSettings({
          variables: {
            settingsData: {
              spaceID: spaceId,
              settings: settingsVariable,
            },
          },
        });

        if (showNotification) {
          notify(t('pages.admin.space.settings.savedSuccessfully'), 'success');
        }
      };

      return new Promise<void>((resolve, reject) => {
        startTransition(async () => {
          try {
            await updateAction();
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    },
    [currentSettings, hostId, spaceId, setOptimisticSettings, startTransition, updateSpaceSettings, notify, t]
  );

  return {
    optimisticSettings,
    isPending,
    updateSettings,
  };
};
