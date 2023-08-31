import { AuthorizationPrivilege } from '../../apollo/generated/graphql-schema';


export default function getPermissions<T extends Record<string, AuthorizationPrivilege>>(
  authorization: { myPrivileges: AuthorizationPrivilege[] | undefined } | undefined, which: T
): { [K in keyof T]: boolean } {
  const result = {} as { [K in keyof T]: boolean };
  const myPrivileges = authorization?.myPrivileges ?? [];
  for (const key in which) {
    result[key] = myPrivileges.includes(which[key]);
  }
  return result;
}
