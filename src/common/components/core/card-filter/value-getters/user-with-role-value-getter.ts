import { WithCardRole } from '../../../../../domain/community/contributor/user/hooks/useUserCardRoleName';
import { ValueType } from '../filterFn';
import { User } from '../../../../../core/apollo/generated/graphql-schema';

export const userWithRoleValueGetter = ({
  id,
  displayName,
  roleName,
  email,
  profile,
}: WithCardRole<User>): ValueType => ({
  id,
  values: [
    displayName,
    email,
    roleName,
    profile?.description || '',
    (profile?.tagsets?.flatMap(x => x.tags) || []).join(' '),
  ],
});
