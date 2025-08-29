import {
  useUpdateWhiteboardContentUpdatePolicyMutation,
  useContentUpdatePolicyQuery,
  useUpdateMemoContentUpdatePolicyMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import useEnsurePresence from '@/core/utils/ensurePresence';

type WhiteboardContentUpdatePolicyProviderProps = {
  elementId: string | undefined;
  elementType: 'whiteboard' | 'memo';
  skip?: boolean;
};

type useContentUpdatePolicyManagerProvided = {
  contentUpdatePolicy: ContentUpdatePolicy | undefined;
  loading: boolean;
  onChange: (contentUpdatePolicy: ContentUpdatePolicy) => Promise<unknown>;
  updating: boolean;
};

const useContentUpdatePolicyManager = ({
  elementId,
  elementType,
  skip = false,
}: WhiteboardContentUpdatePolicyProviderProps): useContentUpdatePolicyManagerProvided => {
  const ensurePresence = useEnsurePresence();

  const { data, loading } = useContentUpdatePolicyQuery({
    variables: {
      elementId: elementId!,
      isWhiteboard: elementType === 'whiteboard',
      isMemo: elementType === 'memo',
    },
    skip: !elementId || skip,
  });

  const contentUpdatePolicy =
    elementType === 'whiteboard'
      ? data?.lookup.whiteboard?.contentUpdatePolicy
      : elementType === 'memo'
        ? data?.lookup.memo?.contentUpdatePolicy
        : undefined;

  const [updateWhiteboard, { loading: updatingWhiteboard }] = useUpdateWhiteboardContentUpdatePolicyMutation();
  const [updateMemo, { loading: updatingMemo }] = useUpdateMemoContentUpdatePolicyMutation();

  const handleOnChangeContentPolicy = (contentUpdatePolicy: ContentUpdatePolicy) => {
    const id = ensurePresence(elementId);

    switch (elementType) {
      case 'whiteboard':
        return updateWhiteboard({
          variables: {
            whiteboardId: id,
            contentUpdatePolicy,
          },
        });
      case 'memo':
        return updateMemo({
          variables: {
            memoId: id,
            contentUpdatePolicy,
          },
        });
      default:
        throw new Error(`Unsupported element type: ${elementType}`);
    }
  };

  return {
    contentUpdatePolicy,
    loading,
    onChange: handleOnChangeContentPolicy,
    updating: updatingWhiteboard || updatingMemo,
  };
};

export default useContentUpdatePolicyManager;
