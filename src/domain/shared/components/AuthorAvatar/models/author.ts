export interface Author {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  url: string;
  tags?: string[];
  city?: string;
  country?: string;
}
