export interface Author {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | undefined;
  url: string;
  tags?: string[];
  city?: string;
  country?: string;
}
