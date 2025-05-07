export enum ContributorSelectorType {
  User = 'user',
  Email = 'email',
}
export type SelectedContributor =
  | {
      type: ContributorSelectorType.User;
      id: string;
      displayName: string;
    }
  | {
      type: ContributorSelectorType.Email;
      email: string;
      displayName?: string;
    };
