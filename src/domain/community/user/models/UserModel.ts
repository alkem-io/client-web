import type { Organization } from '@/core/apollo/generated/graphql-schema';
import type { LocationModel } from '@/domain/common/location/LocationModel';
import type { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import type { TagsetModel } from '@/domain/common/tagset/TagsetModel';

export interface UserModel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  agent?: unknown;
  profile?: {
    id?: string;
    displayName: string;
    description?: string;
    tagline?: string;
    location?: LocationModel;
    tagsets?: TagsetModel[];
    references?: ReferenceModel[];
    url?: string;
    avatar?: {
      uri: string;
    };
  };
  memberof?: {
    communities: Community[];
    organizations: Organization[];
  };
}

interface Community {
  id: string;
  name: string;
  type: string;
}
