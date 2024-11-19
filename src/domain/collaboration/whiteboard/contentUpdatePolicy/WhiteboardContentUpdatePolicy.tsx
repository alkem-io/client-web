import {
  useUpdateWhiteboardContentUpdatePolicyMutation,
  useWhiteboardContentUpdatePolicyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';

type WhiteboardContentUpdatePolicyProviderProps = {
  whiteboardId: string | undefined;
  skip?: boolean;
};

const useWhiteboardContentUpdatePolicy = ({
  whiteboardId,
  skip = false,
}: WhiteboardContentUpdatePolicyProviderProps) => {
  const { data, loading } = useWhiteboardContentUpdatePolicyQuery({
    variables: {
      whiteboardId: whiteboardId!,
    },
    skip: !whiteboardId || skip,
  });

  const { contentUpdatePolicy } = data?.lookup.whiteboard ?? {};

  const [updateContentUpdatePolicy, { loading: updating }] = useUpdateWhiteboardContentUpdatePolicyMutation();

  const handleUpdateContentUpdatePolicy = async (contentUpdatePolicy: ContentUpdatePolicy) => {
    if (!whiteboardId) {
      throw new Error('Whiteboard ID is required');
    }
    return await updateContentUpdatePolicy({
      variables: {
        whiteboardId,
        contentUpdatePolicy,
      },
    });
  };

  return {
    value: contentUpdatePolicy,
    loading,
    onChange: handleUpdateContentUpdatePolicy,
    updating,
  };
};

export default useWhiteboardContentUpdatePolicy;
