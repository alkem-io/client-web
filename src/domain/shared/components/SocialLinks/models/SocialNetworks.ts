// The order of defining the enum fileds determine how links are ordered.
export enum SocialNetworkEnum {
  website = 'website',
  linkedin = 'linkedin',
  github = 'github',
  twitter = 'twitter',
  bsky = 'bsky', // blueSky
  email = 'email',
}

export const socialNames = [
  SocialNetworkEnum.github.toString(),
  SocialNetworkEnum.linkedin.toString(),
  SocialNetworkEnum.bsky.toString(),
];

export const SocialNetworksSortOrder = Object.keys(SocialNetworkEnum).reduce<Record<string, number>>(
  (prev, cur, index) => {
    prev[cur] = index;
    return prev;
  },
  {}
);

export const toSocialNetworkEnum = (type: string): SocialNetworkEnum | undefined => {
  const key = Object.keys(SocialNetworkEnum).find(x => x === type.toLowerCase());
  return key ? SocialNetworkEnum[key] : undefined;
};

export const isSocialNetworkSupported = (type: string) => toSocialNetworkEnum(type) !== undefined;
