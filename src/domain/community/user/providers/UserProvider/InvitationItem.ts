import { ContributionItem } from '../../contribution';

export interface InvitationItem extends ContributionItem {
  createdBy: string;
  welcomeMessage?: string;
  createdDate: Date | string;
}
