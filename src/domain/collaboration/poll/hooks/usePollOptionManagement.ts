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
