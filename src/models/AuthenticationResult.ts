export type AuthenticationResult = {
  user: {
    id: number;
    email: string;
    role: {
      id: number;
      name: string;
    };
  };
  access_token: string;
};

export type RegisterResult = {
  email: string;
  password: string;
  salt: string;
  id: number;
  role: Role;
};

export type Role = {
  id: number;
  name: string;
};
