import { Identifiable } from '../../../core/utils/Identifiable';

export interface ContributionItem extends Identifiable {
  spaceId: string;
  subspaceId?: string;
  subsubspaceId?: string;
}

export interface LegacyContributionItem extends Identifiable {
  spaceId: string;
  challengeId?: string;
  opportunityId?: string;
}
