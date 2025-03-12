import { Identifiable } from '@/core/utils/Identifiable';

export const ROLE_OPTION_ALL = 'ROLE_OPTION_ALL';
export const SPACE_OPTION_ALL = 'SPACE_OPTION_ALL';

export interface LatestContributionsProps {
  spaceMemberships:
    | (Identifiable & {
        about: {
          profile: {
            displayName: string;
          };
        };
      })[]
    | undefined;
  limit?: number;
}
