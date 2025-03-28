import { VisualType } from '@/core/apollo/generated/graphql-schema';
import defaultJourneyAvatar from './Avatar.jpg';
import defaultJourneyBanner from './Banner.jpg';
import defaultJourneyCard from './Card.jpg';

export const defaultVisualUrls = {
  [VisualType.Avatar]: defaultJourneyAvatar,
  [VisualType.Banner]: defaultJourneyBanner,
  [VisualType.Card]: defaultJourneyCard,
  // It's never shown as an uploadable, only replaced when saving a whiteboard, so it doesn't really need a default, but it is useful for typescript validation to define it
  [VisualType.BannerWide]: defaultJourneyBanner,
} as const;
