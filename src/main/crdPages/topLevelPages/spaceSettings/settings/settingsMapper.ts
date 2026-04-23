import { CommunityMembershipPolicy, SpacePrivacyMode } from '@/core/apollo/generated/graphql-schema';
import type {
  AllowedActionToggle,
  MembershipPolicy,
  SpacePrivacy,
} from '@/crd/components/space/settings/SpaceSettingsSettingsView';
import type {
  SpaceSettingsCollaboration,
  SpaceSettingsMembership,
  SpaceSettingsPrivacy,
} from '@/domain/space/settings/SpaceSettingsModel';

export function mapPrivacy(p: SpaceSettingsPrivacy | undefined): SpacePrivacy {
  return p?.mode === SpacePrivacyMode.Private ? 'private' : 'public';
}

export function mapPrivacyToBackend(p: SpacePrivacy): SpacePrivacyMode {
  return p === 'private' ? SpacePrivacyMode.Private : SpacePrivacyMode.Public;
}

export function mapMembershipPolicy(m: SpaceSettingsMembership | undefined): MembershipPolicy {
  switch (m?.policy) {
    case CommunityMembershipPolicy.Open:
      return 'open';
    case CommunityMembershipPolicy.Applications:
      return 'application';
    default:
      return 'invitation';
  }
}

export function mapMembershipPolicyToBackend(p: MembershipPolicy): CommunityMembershipPolicy {
  switch (p) {
    case 'open':
      return CommunityMembershipPolicy.Open;
    case 'application':
      return CommunityMembershipPolicy.Applications;
    case 'invitation':
      return CommunityMembershipPolicy.Invitations;
  }
}

export function mapAllowedActions(
  collab: SpaceSettingsCollaboration | undefined,
  membership: SpaceSettingsMembership | undefined,
  privacy: SpaceSettingsPrivacy | undefined
): AllowedActionToggle[] {
  return [
    { key: 'subspaceAdminInvitations', enabled: membership?.allowSubspaceAdminsToInviteMembers ?? false },
    { key: 'memberCreatePosts', enabled: collab?.allowMembersToCreateCallouts ?? false },
    { key: 'videoCalls', enabled: collab?.allowMembersToVideoCall ?? false },
    { key: 'guestContributions', enabled: collab?.allowGuestContributions ?? false },
    { key: 'memberCreateSubspaces', enabled: collab?.allowMembersToCreateSubspaces ?? false },
    { key: 'subspaceEvents', enabled: collab?.allowEventsFromSubspaces ?? false },
    { key: 'alkemioSupportAccess', enabled: privacy?.allowPlatformSupportAsAdmin ?? false },
  ];
}
