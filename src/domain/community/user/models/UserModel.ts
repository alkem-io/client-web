import { CountryType } from '@/domain/common/location/countries.constants';
import { Organization } from '@/core/apollo/generated/graphql-schema';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { LocationModel } from '@/domain/common/location/LocationModel';

export interface UserModel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  agent?: {};
  profile: {
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
  isContactable: boolean;
}

interface Community {
  id: string;
  name: string;
  type: string;
}

export const defaultUser: UserModel = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  profile: {
    id: '',
    displayName: '',
    description: '',
    tagline: '',
    location: {
      id: '',
      city: '',
      country: '',
    },
    tagsets: [],
    references: [],
  },
  memberof: {
    organizations: [],
    communities: [],
  },
  isContactable: false,
};

/*
Generated userForm interface for yup
*/
export interface UserFormGenerated {
  firstName: string;
  email: string;
  linkedin: string;
  bsky: string;
  github: string;
  displayName: string;
  tagline: string;
  tagsets: TagsetModel[];
  references: ReferenceModel[];
  country: CountryType | null;
  phone: string;
  lastName: string;
  city: string;
  bio: string;
  profileId: string;
}

export interface Member {
  id: string;
  profile: { id: string; displayName: string };
  firstName: string;
  lastName: string;
  email: string;
}
