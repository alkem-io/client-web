import { Identifiable } from '../../shared/types/Identifiable';

export interface ContributionItem extends Identifiable {
  spaceId: string;
  challengeId?: string;
  opportunityId?: string;
}
