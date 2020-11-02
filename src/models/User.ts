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
  avatar: string;
  tags: string[];
  references: string[];
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
  avatar: '',
  tags: [],
  references: [],
};
