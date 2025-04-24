import { ValueType } from '@/core/utils/filtering/filterFn';

interface SpaceAboutFilterable {
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

export const spaceAboutValueGetter = ({ id, about }: SpaceAboutFilterable): ValueType => ({
  id,
  values: [about.profile.displayName, about.profile.tagline ?? '', (about.profile.tagset?.tags || []).join(' ')],
});

export const spaceAboutTagsGetter = ({ about }: SpaceAboutFilterable): string[] => about.profile.tagset?.tags || [];
