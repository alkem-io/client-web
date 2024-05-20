import { ValueType } from '../../../../core/utils/filtering/filterFn';
import { SubspaceCardFragment, SpaceCardQuery } from '../../../../core/apollo/generated/graphql-schema';

/**
 @deprecated
*/
type JourneyCard = Required<SpaceCardQuery['lookup']>['space'] | SubspaceCardFragment;

/**
 @deprecated try to remove these one of these days
*/
export const journeyCardValueGetter = ({ id, profile }: JourneyCard): ValueType => ({
  id,
  values: [profile.displayName, profile.tagline || '', (profile.tagset?.tags || []).join(' ')],
});

/**
 @deprecated
*/
export const journeyCardTagsGetter = ({ profile }: JourneyCard): string[] => profile.tagset?.tags || [];
