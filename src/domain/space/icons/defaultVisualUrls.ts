import { VisualType } from '@/core/apollo/generated/graphql-schema';
import defaultJourneyAvatar from './defaultVisuals/Avatar.jpg';
import defaultJourneyBanner from './defaultVisuals/Banner.jpg';
import defaultJourneyCard from './defaultVisuals/Card.jpg';

export const defaultVisualUrls = {
  [VisualType.Avatar]: defaultJourneyAvatar,
  [VisualType.Banner]: defaultJourneyBanner,
  [VisualType.Card]: defaultJourneyCard,
  // It's never shown as an uploadable, only replaced when saving a whiteboard, so it doesn't really need a default, but it is useful for typescript validation to define it
  [VisualType.BannerWide]: defaultJourneyBanner,
} as const;
