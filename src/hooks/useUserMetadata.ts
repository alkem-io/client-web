import { useUserQuery } from '../generated/graphql';
import { User } from '../types/graphql-schema';
import { useUserMetadataWrapper } from './useUserMetadataWrapper';

export const useUserMetadata = (id: string) => {
  const wrapper = useUserMetadataWrapper();
  const { data } = useUserQuery({ variables: { id } });
  return wrapper(data?.user as User);
};
