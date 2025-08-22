import { useUserModelFullQuery } from '@/core/apollo/generated/apollo-hooks';
import { UserModel } from '@/domain/community/user/models/UserModel';

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
    loading,
  };
};
