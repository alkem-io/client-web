import { BasicSpaceProps } from '../components/BasicSpaceCard';

type VirtualContributor = {
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

export type VCProfilePageViewProps = {
  hasBokId: boolean;
  bokDescription?: string;
  bokProfile?: BasicSpaceProps;
  virtualContributor?: VirtualContributor;
};