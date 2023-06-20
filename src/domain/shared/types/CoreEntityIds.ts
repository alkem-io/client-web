type Required<SourceType extends {}, Props extends keyof SourceType> = {
  [P in Props]-?: SourceType[P];
} & {
  [P in Exclude<keyof SourceType, Props>]?: undefined;
};

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
  typeof ids.challengeNameId === 'undefined' && typeof ids.opportunityNameId === 'undefined';
export const isChallengeId = (ids: OptionalCoreEntityIds): ids is ChallengeIdHolder =>
  typeof ids.challengeNameId === 'string' && typeof ids.opportunityNameId === 'undefined';
export const isOpportunityId = (ids: OptionalCoreEntityIds): ids is OpportunityIdHolder =>
  typeof ids.opportunityNameId === 'string';
export const isChallengeOpportunityIds = (ids: OptionalCoreEntityIds): ids is ChallengeOpportunityIdsHolder =>
  typeof ids.challengeNameId === 'string' && typeof ids.opportunityNameId === 'string';
