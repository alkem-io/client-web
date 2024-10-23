import { BasicSpaceProps } from '../components/BasicSpaceCard';

export type VCProfilePageViewProps = {
  hasBokId: boolean;

  bokDescription?: string;
  bokProfile?: BasicSpaceProps;
  virtualContributor?: {
    profile: {
      displayName: string;
      description?: string;
      avatar?: {
        uri: string;
      };
      location?: {
        city?: string;
        country?: string;
      };
    };
    provider: {
      profile: {
        displayName: string;
        description?: string;
      };
    };
  };
};
