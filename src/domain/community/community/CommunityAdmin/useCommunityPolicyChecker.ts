import { useMemo } from 'react';

const useCommunityPolicyChecker = (
  memberRoleDefinition:
    | {
        organizationPolicy: { minimum: number; maximum: number };
        userPolicy: { minimum: number; maximum: number };
      }
    | undefined,
  leadRoleDefinition:
    | {
        organizationPolicy: { minimum: number; maximum: number };
        userPolicy: { minimum: number; maximum: number };
      }
    | undefined,
  entities: { isLead: boolean }[] | undefined
) =>
  useMemo(() => {
    const leadsCount = (entities ?? []).filter(entity => entity.isLead).length;

    const canAddLeadUser = () => {
      if (!leadRoleDefinition || leadRoleDefinition.userPolicy.maximum === -1) {
        return true;
      } else {
        return leadRoleDefinition.userPolicy.maximum > leadsCount;
      }
    };

    const canRemoveLeadUser = () => {
      if (!leadRoleDefinition || leadRoleDefinition.userPolicy.minimum <= 0) {
        return true;
      } else {
        return leadRoleDefinition.userPolicy.minimum < leadsCount;
      }
    };

    const canAddLeadOrganization = () => {
      if (!leadRoleDefinition || leadRoleDefinition.organizationPolicy.maximum === -1) {
        return true;
      } else {
        return leadRoleDefinition.organizationPolicy.maximum > leadsCount;
      }
    };

    const canRemoveLeadOrganization = () => {
      if (!leadRoleDefinition || leadRoleDefinition.organizationPolicy.minimum <= 0) {
        return true;
      } else {
        return leadRoleDefinition.organizationPolicy.minimum < leadsCount;
      }
    };

    return {
      canAddLeadUser: canAddLeadUser(),
      canRemoveLeadUser: canRemoveLeadUser(),
      canAddLeadOrganization: canAddLeadOrganization(),
      canRemoveLeadOrganization: canRemoveLeadOrganization(),
    };
  }, [memberRoleDefinition, leadRoleDefinition, entities]);

export default useCommunityPolicyChecker;
