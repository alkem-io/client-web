import { useUserModelFullQuery } from '@/core/apollo/generated/apollo-hooks';
import type { UserModel } from '@/domain/community/user/models/UserModel';

/**
 * Allows to retrieve a user, given its ID
 */
export const useUserProvider = (userId: string | undefined) => {
  const { data, loading } = useUserModelFullQuery({
    variables: { userId: userId! },
    skip: !userId,
  });

  const userModel: UserModel | undefined = data?.lookup?.user;

  return {
    userModel: userModel,
    // READ-privilege consent flags (never the email address itself) used to
    // decide the chat vs email-fallback contact route (FR-011).
    isContactable: data?.lookup?.user?.isContactable ?? false,
    isContactableViaEmail: data?.lookup?.user?.isContactableViaEmail ?? false,
    loading,
  };
};
