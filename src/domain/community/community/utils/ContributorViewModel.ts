import { Identifiable } from '@/core/utils/Identifiable';

// TODO clean up fetched data
export interface ContributorViewModel extends Identifiable {
  profile: {
    displayName: string;
    avatar?: {
      uri: string;
    };
    location?: {
      city?: string;
      country?: string;
    };
    tagline?: string;
    tagsets?: {
      tags: string[];
    }[];
    url: string;
  };
  isContactable?: boolean;
}
