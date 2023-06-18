import { useMemo } from 'react';
import { CommunityPolicyFragment } from '../../../../core/apollo/generated/graphql-schema';

const useCommunityPolicyChecker = (
  communicationPolicy: CommunityPolicyFragment | undefined,
  entities: { isLead: boolean }[] | undefined
) =>
  useMemo(() => {
    const leadsCount = (entities ?? []).filter(entity => entity.isLead).length;

    const canAddLeadUser = () => {
      if (!communicationPolicy || communicationPolicy.lead.maxUser === -1) {
        return true;
      } else {
        return communicationPolicy.lead.maxUser > leadsCount;
      }
    };

    const canRemoveLeadUser = () => {
      if (!communicationPolicy || communicationPolicy.lead.minUser <= 0) {
        return true;
      } else {
        return communicationPolicy.lead.minUser < leadsCount;
      }
    };

    const canAddLeadOrganization = () => {
      if (!communicationPolicy || communicationPolicy.lead.maxOrg === -1) {
        return true;
      } else {
        return communicationPolicy.lead.maxOrg > leadsCount;
      }
    };

    const canRemoveLeadOrganization = () => {
      if (!communicationPolicy || communicationPolicy.lead.minOrg <= 0) {
        return true;
      } else {
        return communicationPolicy.lead.minOrg < leadsCount;
      }
    };

    return {
      canAddLeadUser: canAddLeadUser(),
      canRemoveLeadUser: canRemoveLeadUser(),
      canAddLeadOrganization: canAddLeadOrganization(),
      canRemoveLeadOrganization: canRemoveLeadOrganization(),
    };
  }, [communicationPolicy, entities]);

export default useCommunityPolicyChecker;
