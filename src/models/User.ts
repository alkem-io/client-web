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
    description: string;
    avatar: string;
    tagsets: Tagset[];
    references: Array<UserReference>;
  };
  memberof: {
    groups: Group[];
    challenges: Challenge[];
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

export interface UserReference {
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
  references: UserReference[];
  country: string;
  phone: string;
  lastName: string;
  city: string;
  gender: string;
  bio: string;
}
