import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { VisualModel } from '@/domain/common/visual/model/VisualModel';

export type EntityVisualUrls = {
  avatarUrl?: string | undefined;
  cardBannerUrl?: string | undefined;
  bannerUrl?: string | undefined;
  bannerWideUrl?: string | undefined;
};

export const getVisualUrls = (visuals: VisualModel[]): EntityVisualUrls => {
  return {
    avatarUrl: getVisualByType(VisualType.Avatar, visuals)?.uri,
    cardBannerUrl: getVisualByType(VisualType.Card, visuals)?.uri,
    bannerUrl: getVisualByType(VisualType.Banner, visuals)?.uri,
    bannerWideUrl: getVisualByType(VisualType.BannerWide, visuals)?.uri,
  };
};

export const getVisualByType = <T extends { name: string }>(type: VisualType, visualsArray?: T[]): T | undefined =>
  visualsArray?.find(x => x.name.toLowerCase() === type.toLowerCase());
