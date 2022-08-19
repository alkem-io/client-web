type Required<SourceType extends {}, Props extends keyof SourceType> = {
  [P in Props]-?: SourceType[P];
} & {
  [P in Exclude<keyof SourceType, Props>]?: undefined;
};

interface CoreEntityIdTypes {
  hubNameId: string;
  challengeNameId: string;
  opportunityNameId: string;
}

export type OptionalCoreEntityIds = Partial<CoreEntityIdTypes>;

type HubIdHolder = Required<OptionalCoreEntityIds, 'hubNameId'>;
type ChallengeIdHolder = Required<OptionalCoreEntityIds, 'hubNameId' | 'challengeNameId'>;
type OpportunityIdHolder = Required<OptionalCoreEntityIds, 'hubNameId' | 'opportunityNameId'>;

export type CoreEntityIdCombinations = HubIdHolder | ChallengeIdHolder | OpportunityIdHolder;

export const isHubId = (ids: OptionalCoreEntityIds): ids is HubIdHolder =>
  typeof ids.challengeNameId === 'undefined' && typeof ids.opportunityNameId === 'undefined';
export const isChallengeId = (ids: OptionalCoreEntityIds): ids is ChallengeIdHolder =>
  typeof ids.challengeNameId === 'string' && typeof ids.opportunityNameId === 'undefined';
export const isOpportunityId = (ids: OptionalCoreEntityIds): ids is OpportunityIdHolder =>
  typeof ids.opportunityNameId === 'string';
