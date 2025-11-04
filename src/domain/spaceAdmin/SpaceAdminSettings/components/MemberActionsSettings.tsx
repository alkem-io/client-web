import { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { BlockTitle } from '@/core/ui/typography';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { Link } from '@mui/material';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { gutters } from '@/core/ui/grid/utils';
import { defaultSpaceSettings } from '../SpaceDefaultSettings';
import {
  SpaceSettingsCollaboration,
  SpaceSettingsMembership,
  SpaceSettingsPrivacy,
} from '@/domain/space/settings/SpaceSettingsModel';
import { isSubspace, isNotLastLevel } from '@/domain/space/utils/spaceLevel';

interface MemberActionsSettingsProps {
  optimisticSettings: {
    collaboration?: Partial<SpaceSettingsCollaboration>;
    privacy?: Partial<SpaceSettingsPrivacy>;
    membership?: Partial<SpaceSettingsMembership>;
  };
  currentSettings: {
    collaboration?: Partial<SpaceSettingsCollaboration>;
    privacy?: Partial<SpaceSettingsPrivacy>;
    membership?: Partial<SpaceSettingsMembership>;
  };
  level: SpaceLevel;
  membershipsEnabled: boolean;
  subspacesEnabled: boolean;
  onUpdate: (params: Record<string, unknown>) => void;
}

export const MemberActionsSettings: FC<MemberActionsSettingsProps> = ({
  optimisticSettings,
  currentSettings,
  level,
  membershipsEnabled,
  subspacesEnabled,
  onUpdate,
}) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock disableGap>
      <BlockTitle marginBottom={gutters(2)}>{t('pages.admin.space.settings.memberActions.title')}</BlockTitle>

      {/* Subspace Admin Invitations */}
      {isNotLastLevel(level) && membershipsEnabled && (
        <SwitchSettingsGroup
          options={{
            allowSubspaceAdminsToInviteMembers: {
              checked:
                currentSettings?.membership?.allowSubspaceAdminsToInviteMembers ??
                defaultSpaceSettings.membership.allowSubspaceAdminsToInviteMembers,
              label: (
                <Trans
                  i18nKey={
                    isSubspace(level)
                      ? 'pages.admin.space.settings.membership.allowSubspaceAdminsToInviteMembersSubspace'
                      : 'pages.admin.space.settings.membership.allowSubspaceAdminsToInviteMembers'
                  }
                  components={{ b: <strong /> }}
                />
              ),
            },
          }}
          onChange={(setting, newValue) => onUpdate({ [setting]: newValue })}
        />
      )}

      {/* Create Posts/Callouts */}
      <SwitchSettingsGroup
        options={{
          allowMembersToCreateCallouts: {
            checked:
              optimisticSettings?.collaboration?.allowMembersToCreateCallouts ??
              defaultSpaceSettings.collaboration.allowMembersToCreateCallouts,
            label: (
              <Trans i18nKey="pages.admin.space.settings.memberActions.createBlocks" components={{ b: <strong /> }} />
            ),
          },
        }}
        onChange={(setting, newValue) => onUpdate({ [setting]: newValue })}
      />

      {/* Video Call */}
      <SwitchSettingsGroup
        options={{
          allowMembersToVideoCall: {
            checked:
              optimisticSettings?.collaboration?.allowMembersToVideoCall ??
              defaultSpaceSettings.collaboration.allowMembersToVideoCall,
            label: (
              <Trans
                i18nKey="pages.admin.space.settings.memberActions.videoCall"
                components={{
                  b: <strong />,
                  jitsiInfoLink: <Link href="https://jitsi.org/" target="_blank" rel="noopener noreferrer" />,
                }}
              />
            ),
          },
        }}
        onChange={(setting, newValue) => onUpdate({ [setting]: newValue })}
      />

      {/* Guest Contributions */}
      <SwitchSettingsGroup
        options={{
          allowGuestContributions: {
            checked:
              optimisticSettings?.collaboration?.allowGuestContributions ??
              defaultSpaceSettings.collaboration.allowGuestContributions,
            label: (
              <Trans
                i18nKey="pages.admin.space.settings.memberActions.guestContributions"
                components={{ b: <strong /> }}
              />
            ),
          },
        }}
        onChange={(setting, newValue) => onUpdate({ [setting]: newValue })}
      />

      {/* Create Subspaces */}
      {subspacesEnabled && (
        <SwitchSettingsGroup
          options={{
            allowMembersToCreateSubspaces: {
              checked:
                optimisticSettings?.collaboration?.allowMembersToCreateSubspaces ??
                defaultSpaceSettings.collaboration.allowMembersToCreateSubspaces,
              label: (
                <Trans
                  i18nKey="pages.admin.space.settings.memberActions.createSubspaces"
                  components={{ b: <strong /> }}
                />
              ),
            },
          }}
          onChange={(setting, newValue) => onUpdate({ [setting]: newValue })}
        />
      )}

      {/* Inherit Membership Rights */}
      {isSubspace(level) && (
        <SwitchSettingsGroup
          options={{
            inheritMembershipRights: {
              checked:
                optimisticSettings?.collaboration?.inheritMembershipRights ??
                defaultSpaceSettings.collaboration.inheritMembershipRights,
              label: (
                <Trans
                  i18nKey="pages.admin.space.settings.memberActions.inheritRights"
                  components={{ b: <strong /> }}
                />
              ),
            },
          }}
          onChange={(setting, newValue) => onUpdate({ [setting]: newValue })}
        />
      )}

      {/* Events from Subspaces */}
      {!isSubspace(level) && subspacesEnabled && (
        <SwitchSettingsGroup
          options={{
            allowEventsFromSubspaces: {
              checked:
                currentSettings.collaboration?.allowEventsFromSubspaces ??
                defaultSpaceSettings.collaboration.allowEventsFromSubspaces,
              label: (
                <Trans
                  i18nKey="pages.admin.space.settings.memberActions.eventsFromSubspaces"
                  components={{ b: <strong /> }}
                />
              ),
            },
          }}
          onChange={(setting, newValue) => onUpdate({ [setting]: newValue })}
        />
      )}

      {/* Platform Support as Admin */}
      {!isSubspace(level) && subspacesEnabled && (
        <SwitchSettingsGroup
          options={{
            allowPlatformSupportAsAdmin: {
              checked:
                currentSettings?.privacy?.allowPlatformSupportAsAdmin ??
                defaultSpaceSettings.privacy.allowPlatformSupportAsAdmin,
              label: (
                <Trans
                  i18nKey="pages.admin.space.settings.memberActions.supportAsAdmin"
                  components={{ b: <strong /> }}
                />
              ),
            },
          }}
          onChange={(setting, newValue) => onUpdate({ [setting]: newValue })}
        />
      )}
    </PageContentBlock>
  );
};
