import { useWhiteboardDraftDetailsByIdQuery } from '@/core/apollo/generated/apollo-hooks';

/**
 * The draft's stored WHITEBOARD_PREVIEW uri. The editor uploads it in the
 * background on close, and the upload result updates the cached Visual, so the
 * create form's thumbnail follows the draft without a refetch.
 */
export const useWhiteboardDraftPreviewUrl = (whiteboardID: string): string | undefined => {
  const { data } = useWhiteboardDraftDetailsByIdQuery({ variables: { whiteboardId: whiteboardID } });
  return data?.lookup.whiteboard?.profile.preview?.uri || undefined;
};
