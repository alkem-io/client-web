import { ValueType } from '../filterFn';
import {
  ChallengeCardFragment,
  Hub,
  OpportunityCardFragment,
} from '../../../../../core/apollo/generated/graphql-schema';

type JourneyCard = Hub | ChallengeCardFragment | OpportunityCardFragment;

export const journeyCardValueGetter = ({ id, displayName, tagset, context: c }: JourneyCard): ValueType => ({
  id,
  values: [displayName, c?.tagline || '', (tagset?.tags || []).join(' ')],
});

export const journeyCardTagsGetter = ({ tagset }: JourneyCard): string[] => tagset?.tags || [];
