import { SpaceVisibility } from '../../../core/apollo/generated/graphql-schema';

export interface Account {
  license: {
    visibility?: SpaceVisibility;
  };
  host?: {
    profile: {
      displayName: string;
    };
  };
}
