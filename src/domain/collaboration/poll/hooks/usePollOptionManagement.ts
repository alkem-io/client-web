import { useCallback } from 'react';
import {
  useAddPollOptionMutation,
  useRemovePollOptionMutation,
  useReorderPollOptionsMutation,
  useUpdatePollOptionMutation,
} from '@/core/apollo/generated/apollo-hooks';

type UsePollOptionManagementParams = {
  pollId: string;
};

export const usePollOptionManagement = ({ pollId }: UsePollOptionManagementParams) => {
  const [addPollOptionMutation, { loading: addLoading }] = useAddPollOptionMutation();
  const [updatePollOptionMutation, { loading: updateLoading }] = useUpdatePollOptionMutation();
  const [removePollOptionMutation, { loading: removeLoading }] = useRemovePollOptionMutation();
  const [reorderPollOptionsMutation, { loading: reorderLoading }] = useReorderPollOptionsMutation();

  const addOption = useCallback(
    (text: string) =>
      addPollOptionMutation({
        variables: { optionData: { pollID: pollId, text } },
      }),
    [pollId, addPollOptionMutation]
  );

  const updateOption = useCallback(
    (optionID: string, text: string) =>
      updatePollOptionMutation({
        variables: { optionData: { pollID: pollId, optionID, text } },
      }),
    [pollId, updatePollOptionMutation]
  );

  const removeOption = useCallback(
    (optionID: string) =>
      removePollOptionMutation({
        variables: { optionData: { pollID: pollId, optionID } },
      }),
    [pollId, removePollOptionMutation]
  );

  const reorderOptions = useCallback(
    (optionIDs: string[]) =>
      reorderPollOptionsMutation({
        variables: { optionData: { pollID: pollId, optionIDs } },
      }),
    [pollId, reorderPollOptionsMutation]
  );

  return {
    addOption,
    updateOption,
    removeOption,
    reorderOptions,
    loading: addLoading || updateLoading || removeLoading || reorderLoading,
  };
};
