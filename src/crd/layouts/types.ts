export type CrdUserInfo = {
  name: string;
  avatarUrl?: string;
  initials: string;
  role?: string;
};

export type CrdNavigationHrefs = {
  home: string;
  spaces: string;
  messages: string;
  notifications: string;
  profile: string;
  account: string;
  admin: string;
  login: string;
};

export type CrdFooterLinks = {
  terms?: string;
  privacy?: string;
  security?: string;
  about?: string;
};

export type CrdLanguageOption = {
  code: string;
  label: string;
};
