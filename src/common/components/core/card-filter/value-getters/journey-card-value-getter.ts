import { ValueType } from '../filterFn';
import {
  ChallengeCardFragment,
  HubCardQuery,
  OpportunityCardFragment,
} from '../../../../../core/apollo/generated/graphql-schema';

type JourneyCard = HubCardQuery['hub'] | ChallengeCardFragment | OpportunityCardFragment;

export const journeyCardValueGetter = ({ id, displayName, tagset, context }: JourneyCard): ValueType => ({
  id,
  values: [displayName, context?.tagline || '', (tagset?.tags || []).join(' ')],
});

export const journeyCardTagsGetter = ({ tagset }: JourneyCard): string[] => tagset?.tags || [];
