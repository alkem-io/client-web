import { ValueType } from '@/core/utils/filtering/filterFn';

interface JourneyCard {
  id: string;
  about: {
    profile: {
      displayName: string;
      tagline?: string;
      tagset?: {
        tags: string[];
      };
    };
  };
}

/**
 @deprecated try to remove these one of these days
*/
export const journeyCardValueGetter = ({ id, about }: JourneyCard): ValueType => ({
  id,
  values: [about.profile.displayName, about.profile.tagline ?? '', (about.profile.tagset?.tags || []).join(' ')],
});

/**
 @deprecated
*/
export const journeyCardTagsGetter = ({ about }: JourneyCard): string[] => about.profile.tagset?.tags || [];
