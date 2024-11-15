import { ValueType } from '@/core/utils/filtering/filterFn';

interface JourneyCard {
  id: string;
  profile: {
    displayName: string;
    tagline?: string;
    tagset?: {
      tags: string[];
    };
  };
}

/**
 @deprecated try to remove these one of these days
*/
export const journeyCardValueGetter = ({ id, profile }: JourneyCard): ValueType => ({
  id,
  values: [profile.displayName, profile.tagline ?? '', (profile.tagset?.tags || []).join(' ')],
});

/**
 @deprecated
*/
export const journeyCardTagsGetter = ({ profile }: JourneyCard): string[] => profile.tagset?.tags || [];
