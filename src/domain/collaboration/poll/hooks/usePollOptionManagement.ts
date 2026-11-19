import type { DefaultContext } from '@apollo/client';
import {
  useAddPollOptionMutation,
  useRemovePollOptionMutation,
  useReorderPollOptionsMutation,
  useUpdatePollOptionMutation,
} from '@/core/apollo/generated/apollo-hooks';

type UsePollOptionManagementParams = {
  pollId: string;
  /** Apollo context for every option mutation — a caller that reports failures itself passes `skipGlobalErrorHandler`. */
  context?: DefaultContext;
};

export const usePollOptionManagement = ({ pollId, context }: UsePollOptionManagementParams) => {
  const [addPollOptionMutation, { loading: addLoading }] = useAddPollOptionMutation({ context });
  const [updatePollOptionMutation, { loading: updateLoading }] = useUpdatePollOptionMutation({ context });
  const [removePollOptionMutation, { loading: removeLoading }] = useRemovePollOptionMutation({ context });
  const [reorderPollOptionsMutation, { loading: reorderLoading }] = useReorderPollOptionsMutation({ context });

  const addOption = (text: string) =>
    addPollOptionMutation({
      variables: { optionData: { pollID: pollId, text } },
    });

  const updateOption = (optionID: string, text: string) =>
    updatePollOptionMutation({
      variables: { optionData: { pollID: pollId, optionID, text } },
    });

  const removeOption = (optionID: string) =>
    removePollOptionMutation({
      variables: { optionData: { pollID: pollId, optionID } },
    });

  const reorderOptions = (optionIDs: string[]) =>
    reorderPollOptionsMutation({
      variables: { optionData: { pollID: pollId, optionIDs } },
    });

  return {
    addOption,
    updateOption,
    removeOption,
    reorderOptions,
    loading: addLoading || updateLoading || removeLoading || reorderLoading,
  };
};
