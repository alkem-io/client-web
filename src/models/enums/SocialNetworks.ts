export enum SocialNetworkEnum {
  linkedin = 'linkedin',
  github = 'github',
  twitter = 'twitter',
  email = 'email',
}

export const toSocialNetworkEnum = (type: string): SocialNetworkEnum | undefined => {
  const key = Object.keys(SocialNetworkEnum).find(x => x === type.toLowerCase());
  return key ? SocialNetworkEnum[key] : undefined;
};

export const isSocialNetworkSupported = (type: string) => toSocialNetworkEnum(type) !== undefined;
