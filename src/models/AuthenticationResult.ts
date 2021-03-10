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
