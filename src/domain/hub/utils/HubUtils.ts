const CONCATENATED_UUIDS_REGEX = /^([a-fA-F\-0-9]+)\/([a-fA-F\-0-9]+)$/;

/**
 * Handles concatenated {OrgId}/{HubId} identifiers coming from the Role Service
 * @param hubId HubId or OrganizationId/HubId
 * @returns HubId
 */
export const handleHubId = (hubId: string) => {
  if (CONCATENATED_UUIDS_REGEX.test(hubId)) {
    hubId = hubId.match(CONCATENATED_UUIDS_REGEX)![2];
  }
  return hubId;
};
