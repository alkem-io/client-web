type Required<SourceType extends {}, Props extends keyof SourceType> = {
  [P in Props]-?: SourceType[P];
} & {
  [P in Exclude<keyof SourceType, Props>]?: undefined;
};

/**
 * @deprecated - switch to UUIDs/RouteResolver
 */
export interface CoreEntityIdTypes {
  spaceNameId: string;
  challengeNameId?: string;
  opportunityNameId?: string;
}

export type OptionalCoreEntityIds = Partial<CoreEntityIdTypes>;

export type SpaceIdHolder = Required<CoreEntityIdTypes, 'spaceNameId'>;
export type ChallengeIdHolder = Required<CoreEntityIdTypes, 'spaceNameId' | 'challengeNameId'>;
export type OpportunityIdHolder = Required<CoreEntityIdTypes, 'spaceNameId' | 'opportunityNameId'>;
export type ChallengeOpportunityIdsHolder = Required<
  CoreEntityIdTypes,
  'spaceNameId' | 'challengeNameId' | 'opportunityNameId'
>;

export const isSpaceId = (ids: OptionalCoreEntityIds): ids is SpaceIdHolder =>
  !ids.challengeNameId && !ids.opportunityNameId;
export const isChallengeId = (ids: OptionalCoreEntityIds): ids is ChallengeIdHolder =>
  Boolean(ids.challengeNameId) && !ids.opportunityNameId;
export const isOpportunityId = (ids: OptionalCoreEntityIds): ids is OpportunityIdHolder =>
  Boolean(ids.opportunityNameId);
export const isChallengeOpportunityIds = (ids: OptionalCoreEntityIds): ids is ChallengeOpportunityIdsHolder =>
  Boolean(ids.challengeNameId) && Boolean(ids.opportunityNameId);
