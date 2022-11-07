type Required<SourceType extends {}, Props extends keyof SourceType> = {
  [P in Props]-?: SourceType[P];
} & {
  [P in Exclude<keyof SourceType, Props>]?: undefined;
};

export interface CoreEntityIdTypes {
  hubNameId: string;
  challengeNameId?: string;
  opportunityNameId?: string;
}

export type OptionalCoreEntityIds = Partial<CoreEntityIdTypes>;

export type HubIdHolder = Required<CoreEntityIdTypes, 'hubNameId'>;
export type ChallengeIdHolder = Required<CoreEntityIdTypes, 'hubNameId' | 'challengeNameId'>;
export type OpportunityIdHolder = Required<CoreEntityIdTypes, 'hubNameId' | 'opportunityNameId'>;
export type ChallengeOpportunityIdsHolder = Required<
  CoreEntityIdTypes,
  'hubNameId' | 'challengeNameId' | 'opportunityNameId'
>;

export const isHubId = (ids: OptionalCoreEntityIds): ids is HubIdHolder =>
  typeof ids.challengeNameId === 'undefined' && typeof ids.opportunityNameId === 'undefined';
export const isChallengeId = (ids: OptionalCoreEntityIds): ids is ChallengeIdHolder =>
  typeof ids.challengeNameId === 'string' && typeof ids.opportunityNameId === 'undefined';
export const isOpportunityId = (ids: OptionalCoreEntityIds): ids is OpportunityIdHolder =>
  typeof ids.opportunityNameId === 'string';
export const isChallengeOpportunityIds = (ids: OptionalCoreEntityIds): ids is ChallengeOpportunityIdsHolder =>
  typeof ids.challengeNameId === 'string' && typeof ids.opportunityNameId === 'string';
