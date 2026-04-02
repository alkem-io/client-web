import type { ReactNode } from 'react';

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

export type CrdPlatformNavigationItem = {
  icon: ReactNode;
  label: string;
  href: string;
};

export type CrdNotificationItemData = {
  id: string;
  title: string;
  description: string;
  comment?: string;
  avatarUrl?: string;
  avatarFallback: string;
  timestamp: string;
  isUnread: boolean;
  href?: string;
  typeBadgeIcon?: ReactNode;
};

export type CrdNotificationFilter = {
  key: string;
  label: string;
};
