import { VisualType } from '@/core/apollo/generated/graphql-schema';
import defaultJourneyAvatar from '@/domain/journey/defaultVisuals/Avatar.jpg';
import defaultJourneyBanner from '@/domain/journey/defaultVisuals/Banner.jpg';
import defaultJourneyCard from '@/domain/journey/defaultVisuals/Card.jpg';

export const defaultVisualUrls = {
  [VisualType.Avatar]: defaultJourneyAvatar,
  [VisualType.Banner]: defaultJourneyBanner,
  [VisualType.Card]: defaultJourneyCard,
  // It's never shown as an uploadable, only replaced when saving a whiteboard, so it doesn't need a default
  //[VisualType.BannerWide]: defaultJourneyBanner,
} as const;
