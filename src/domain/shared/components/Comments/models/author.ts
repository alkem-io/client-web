export interface Author {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  url: string;
  tags?: string[];
  roleName?: string;
  city?: string;
  country?: string;
}
