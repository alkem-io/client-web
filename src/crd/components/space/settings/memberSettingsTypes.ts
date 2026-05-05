export type MemberSettingsUserSubject = {
  type: 'user';
  id: string;
  displayName: string;
  firstName?: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
  isLead: boolean;
  isAdmin: boolean;
};

export type MemberSettingsOrganizationSubject = {
  type: 'organization';
  id: string;
  displayName: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
  isLead: boolean;
};

export type MemberSettingsSubject = MemberSettingsUserSubject | MemberSettingsOrganizationSubject;

export type MemberSettingsLeadPolicy = {
  canAddLead: boolean;
  canRemoveLead: boolean;
};
