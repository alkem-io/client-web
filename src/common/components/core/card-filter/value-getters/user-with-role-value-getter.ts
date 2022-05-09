import { WithCardRole } from '../../../../../hooks';
import { ValueType } from '../filterFn';
import { User } from '../../../../../models/graphql-schema';

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
