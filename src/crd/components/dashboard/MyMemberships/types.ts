export type MembershipRole = 'admin' | 'lead' | 'member';

export type MembershipItem = {
  id: string;
  name: string;
  href: string;
  tagline?: string;
  isPrivate: boolean;
  roles: MembershipRole[];
  initials: string;
  color: string;
  image?: string;
  children?: MembershipItem[];
};

export type MyMembershipsPanelProps = {
  open: boolean;
  onClose: () => void;
  items: MembershipItem[];
  loading?: boolean;
  onNavigate: (href: string) => void;
  browseAllHref: string;
};
