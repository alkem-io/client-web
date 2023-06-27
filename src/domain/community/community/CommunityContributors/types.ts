import { OrganizationCardFragment, UserCardFragment } from '../../../../core/apollo/generated/graphql-schema';

export type ContributorType = 'leading' | 'member';

export interface Contributors {
  organizations: OrganizationCardFragment[];
  users: UserCardFragment[];
}
