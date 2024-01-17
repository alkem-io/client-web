import {
  useUpdateWhiteboardRtContentUpdatePolicyMutation,
  useWhiteboardRtContentUpdatePolicyQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { ContentUpdatePolicy } from '../../../../../core/apollo/generated/graphql-schema';

interface WhiteboardRtContentUpdatePolicyProviderProps {
  whiteboardId: string | undefined;
}

const useWhiteboardRtContentUpdatePolicy = ({ whiteboardId }: WhiteboardRtContentUpdatePolicyProviderProps) => {
  const { data, loading } = useWhiteboardRtContentUpdatePolicyQuery({
    variables: {
      whiteboardId: whiteboardId!,
    },
    skip: !whiteboardId,
  });

  const { contentUpdatePolicy } = data?.lookup.whiteboardRt ?? {};

  const [updateContentUpdatePolicy, { loading: updating }] = useUpdateWhiteboardRtContentUpdatePolicyMutation();

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

export default useWhiteboardRtContentUpdatePolicy;
