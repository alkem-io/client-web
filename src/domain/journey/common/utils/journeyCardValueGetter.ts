import { ValueType } from '../../../../core/utils/filtering/filterFn';
import { SubspaceCardFragment, SpaceCardQuery } from '../../../../core/apollo/generated/graphql-schema';

type JourneyCard = SpaceCardQuery['space'] | SubspaceCardFragment;

export const journeyCardValueGetter = ({ id, profile }: JourneyCard): ValueType => ({
  id,
  values: [profile.displayName, profile.tagline || '', (profile.tagset?.tags || []).join(' ')],
});

export const journeyCardTagsGetter = ({ profile }: JourneyCard): string[] => profile.tagset?.tags || [];
