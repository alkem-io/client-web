import { CountryType } from './constants';
import { Organization } from './graphql-schema';
import { Reference, Tagset } from './Profile';

export interface UserModel {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  agent?: {};
  profile: {
    id?: string;
    description: string;
    location: {
      city: string;
      country: string;
    };
    tagsets: Tagset[];
    references: Reference[];
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
  displayName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
  profile: {
    id: '',
    description: '',
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
  tagsets: Tagset[];
  references: Reference[];
  country: CountryType | null;
  phone: string;
  lastName: string;
  city: string;
  gender: string;
  bio: string;
  profileId: string;
}

export interface Member {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
}
