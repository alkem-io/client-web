import { UserWithCardRole } from '../../../../hooks';
import { ValueType } from '../filterFn';

export const userWithRoleValueGetter = ({
  id,
  displayName,
  country,
  city,
  roleName,
  email,
  profile,
}: UserWithCardRole): ValueType => ({
  id,
  values: [
    displayName,
    country,
    city,
    email,
    roleName,
    profile?.description || '',
    (profile?.tagsets?.flatMap(x => x.tags) || []).join(' '),
  ],
});
