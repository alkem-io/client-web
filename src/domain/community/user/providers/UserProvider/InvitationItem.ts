import { SpaceHostedItem } from '../../../../journey/utils/SpaceHostedItem';

export interface InvitationItem extends SpaceHostedItem {
  createdBy: string;
  welcomeMessage?: string;
  createdDate: Date | string;
}
