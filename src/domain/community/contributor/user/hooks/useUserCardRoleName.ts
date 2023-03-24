import { Agent } from '../../../../../core/apollo/generated/graphql-schema';
import getUserRoleTranslationKey from '../../../../../common/utils/user-role-name/get-user-role-translation-key';

export type WithCredentials = { agent?: Pick<Agent, 'credentials'> };

export const getUserCardRoleNameKey = <T extends WithCredentials>(x: T, resourceId: string) =>
  getUserRoleTranslationKey(resourceId, x?.agent);
