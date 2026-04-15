import type { SaveBarState } from './shell';

export type InvitationPolicy = 'open' | 'invite-only' | 'application';

export type MemberRow = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  isLead: boolean;
};

export type ApplicationQuestion = {
  id: string;
  question: string;
  required: boolean;
};

export type CommunityViewProps = {
  members: MemberRow[];
  leads: MemberRow[];
  invitationPolicy: InvitationPolicy;
  membershipApplicationForm: ApplicationQuestion[];
  communityGuidelines: string;
  saveBar: SaveBarState;
  onRemoveMember: (userId: string) => void;
  onPromoteToLead: (userId: string) => void;
  onDemoteFromLead: (userId: string) => void;
  onInvitationPolicyChange: (next: InvitationPolicy) => void;
  onApplicationFormChange: (questions: ApplicationQuestion[]) => void;
  onGuidelinesChange: (markdown: string) => void;
  onSave: () => void;
  onReset: () => void;
};
