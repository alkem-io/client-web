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
  /**
   * Pre-rendered ReactNode. The consumer is responsible for rendering `<Trans>`
   * (for translation strings with HTML tags like `<b>`, `<br />`, `<i>`) or any
   * other rich content. Never a raw template string that would display escaped.
   */
  title: ReactNode;
  /** Pre-rendered ReactNode — see `title`. Omitted when the description key resolves to empty. */
  description?: ReactNode;
  /**
   * Pre-rendered ReactNode of the user-generated comment/message, typically
   * rendered via `InlineMarkdown` so markdown/HTML is rendered (not displayed
   * as escaped text).
   */
  comment?: ReactNode;
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
