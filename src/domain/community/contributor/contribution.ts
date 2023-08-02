import { Identifiable } from '../../shared/types/Identifiable';

// TODO extend with state but not globally
export interface ContributionItem extends Identifiable {
  spaceId: string;
  challengeId?: string;
  opportunityId?: string;
}
