import { VisualType } from '@/core/apollo/generated/graphql-schema';

export const defaultVisualUrls = {
  [VisualType.Avatar]: '/default-visuals/space/avatar.jpg',
  [VisualType.Banner]: '/default-visuals/space/banner.jpg',
  [VisualType.Card]: '/default-visuals/space/card.jpg',
  // It's never shown as an uploadable, only replaced when saving a whiteboard, so it doesn't really need a default, but it is useful for typescript validation to define it
  [VisualType.BannerWide]: '/default-visuals/space/banner.jpg',
} as const;
