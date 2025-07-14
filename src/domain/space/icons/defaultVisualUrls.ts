import { VisualType } from '@/core/apollo/generated/graphql-schema';

const pathPrefix = '/default-visuals/space/';
const avatarFolder = 'avatar/';
const cardFolder = 'card/';
const bannerFolder = 'banner/';
const defaultIndex = '-1'; // Default index for the visual URLs

const generateVisualUrls = (folder: string, visualType: VisualType) => {
  const urls: Record<string, string> = {};

  urls[defaultIndex] = `${pathPrefix}${folder}alkemio-default-${visualType.toLowerCase()}.jpg`;

  for (let i = 0; i < 16; i++) {
    const hexKey = i.toString(16); // Convert to hex: 0,1,2...9,a,b,c,d,e,f
    urls[hexKey] = `${pathPrefix}${folder}alkemio-default-${visualType.toLowerCase()}-${hexKey}.jpg`;
  }

  return urls;
};

export const defaultSpaceVisualUrls = {
  [VisualType.Avatar]: generateVisualUrls(avatarFolder, VisualType.Avatar),
  [VisualType.Card]: generateVisualUrls(cardFolder, VisualType.Card),
  [VisualType.Banner]: generateVisualUrls(bannerFolder, VisualType.Banner),
} as const;

export const getDefaultSpaceVisualUrl = (visualType: VisualType, id?: string | undefined): string => {
  if (!id || !id.trim()) {
    return defaultSpaceVisualUrls[visualType][defaultIndex];
  }

  const hexChar = id[0]?.toLowerCase();
  const isValidHex = /^[0-9a-f]$/.test(hexChar);

  if (isValidHex && defaultSpaceVisualUrls[visualType][hexChar]) {
    return defaultSpaceVisualUrls[visualType][hexChar];
  }

  return defaultSpaceVisualUrls[visualType][defaultIndex];
};
