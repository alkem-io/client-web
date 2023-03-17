import { ValueType } from '../filterFn';
import {
  ChallengeCardFragment,
  HubCardQuery,
  OpportunityCardFragment,
} from '../../../../../core/apollo/generated/graphql-schema';

type JourneyCard = HubCardQuery['hub'] | ChallengeCardFragment | OpportunityCardFragment;

export const journeyCardValueGetter = ({ id, profile }: JourneyCard): ValueType => ({
  id,
  values: [profile.displayName, profile.tagline || '', (profile.tagset?.tags || []).join(' ')],
});

export const journeyCardTagsGetter = ({ profile }: JourneyCard): string[] => profile.tagset?.tags || [];
