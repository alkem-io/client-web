import {
  AuthorizationPrivilege,
  CalloutAllowedContributors,
  CalloutContributionType,
} from '@/core/apollo/generated/graphql-schema';
import { CalloutSettingsModelFull } from '../../callout/models/CalloutSettingsModel';

interface CollaborationPermissionsParams {
  callout:
    | {
        authorization?: {
          myPrivileges?: AuthorizationPrivilege[];
        };
        settings: {
          contribution: CalloutSettingsModelFull['contribution'];
        };
      }
    | undefined;
  contributionType: CalloutContributionType;
}

const useCalloutCollaborationPermissions = ({ callout, contributionType }: CollaborationPermissionsParams) => {
  const canCreateContribution = (() => {
    if (
      !callout ||
      !callout.settings.contribution.enabled ||
      callout.settings.contribution.canAddContributions.includes(CalloutAllowedContributors.None)
    ) {
      return false;
    }

    const calloutPrivileges = callout.authorization?.myPrivileges ?? [];
    const requiredPrivileges = [AuthorizationPrivilege.Contribute];

    if (callout.settings.contribution.canAddContributions.includes(CalloutAllowedContributors.Admins)) {
      requiredPrivileges.push(AuthorizationPrivilege.Update);
    }

    switch (contributionType) {
      case CalloutContributionType.Whiteboard:
        requiredPrivileges.push(AuthorizationPrivilege.CreateWhiteboard);
        break;
      case CalloutContributionType.Post:
        requiredPrivileges.push(AuthorizationPrivilege.CreatePost);
        break;
      case CalloutContributionType.Memo:
        // CreateMemo privilege does not exist yet
        // requiredPrivileges.push(AuthorizationPrivilege.CreateMemo);
        break;
      case CalloutContributionType.Link:
        // No additional privilege required for Links
        break;
      default:
        break;
    }

    return requiredPrivileges.every(privilege => calloutPrivileges.includes(privilege));
  })();

  return {
    canCreateContribution,
  };
};

export default useCalloutCollaborationPermissions;
