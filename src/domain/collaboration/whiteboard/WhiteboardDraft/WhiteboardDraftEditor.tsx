import { useWhiteboardDraftDetailsByIdQuery } from '@/core/apollo/generated/apollo-hooks';
import CrdWhiteboardView from '@/main/crdPages/whiteboard/CrdWhiteboardView';
import type { WhiteboardDraftLifecycle } from './useWhiteboardDraft';

type WhiteboardDraftEditorProps = {
  whiteboardID: string;
  displayName: string;
  onClose: () => void;
  draftLifecycle: Pick<WhiteboardDraftLifecycle, 'preparationRef' | 'prepared'>;
};

/** Opens a draft through the same collaborative editor used by final boards. */
export const WhiteboardDraftEditor = ({
  whiteboardID,
  displayName,
  onClose,
  draftLifecycle,
}: WhiteboardDraftEditorProps) => {
  const { data, loading } = useWhiteboardDraftDetailsByIdQuery({ variables: { whiteboardId: whiteboardID } });
  const whiteboard = data?.lookup.whiteboard;
  return (
    <CrdWhiteboardView
      whiteboardId={whiteboardID}
      whiteboard={whiteboard}
      authorization={whiteboard?.authorization}
      whiteboardShareUrl=""
      displayName={displayName}
      readOnlyDisplayName={true}
      preventWhiteboardDeletion={true}
      loadingWhiteboards={loading}
      consumptionPreparationRef={draftLifecycle.preparationRef}
      backToWhiteboards={() => {
        draftLifecycle.prepared();
        onClose();
      }}
    />
  );
};
