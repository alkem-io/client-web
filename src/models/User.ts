import { Organisation } from '../generated/graphql';

export interface UserModel {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  gender: string;
  aadPassword: string;
  accountUpn: string;
  profile: {
    id?: string;
    description: string;
    avatar: string;
    tagsets: Tagset[];
    references: Reference[];
  };
  memberof: {
    groups: Group[];
    challenges: Challenge[];
    organisations: Organisation[];
  };
}

interface Challenge {
  id: string;
  name: string;
  textID: string;
}
interface Group {
  id: string;
  name: string;
}
export interface Tagset {
  name: string;
  tags: Array<string>;
}

export interface Reference {
  id: string;
  name: string;
  uri: string;
}

export const defaultUser: UserModel = {
  id: '',
  name: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  country: '',
  gender: '',
  aadPassword: '',
  accountUpn: '',
  profile: {
    description: '',
    avatar: '',
    tagsets: [],
    references: [],
  },
  memberof: {
    challenges: [],
    groups: [],
    organisations: [],
  },
};

/*
Generated userForm interface for yup
*/
export interface UserFromGenerated {
  firstName: string;
  email: string;
  name: string;
  avatar: string;
  tagsets: Tagset[];
  references: Reference[];
  country: string;
  phone: string;
  lastName: string;
  city: string;
  gender: string;
  bio: string;
  challenges: string;
  groups: string;
}
