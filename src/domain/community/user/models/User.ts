import { CountryType } from '../../../common/location/countries.constants';
import { Organization } from '@/core/apollo/generated/graphql-schema';
import { Reference, Tagset } from '../../../common/profile/Profile';

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
    location?: {
      city?: string;
      country?: string;
    };
    tagsets?: Tagset[];
    references?: Reference[];
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
  groups: Group[];
}

interface Group {
  id: string;
  name: string;
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
};

/*
Generated userForm interface for yup
*/
export interface UserFormGenerated {
  firstName: string;
  email: string;
  linkedin: string;
  twitter: string;
  github: string;
  displayName: string;
  tagline: string;
  tagsets: Tagset[];
  references: Reference[];
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
