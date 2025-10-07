import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import FullscreenButton from '@/core/ui/button/FullscreenButton';
import { useFullscreen } from '@/core/ui/fullscreen/useFullscreen';
import ShareButton from '@/domain/shared/components/ShareDialog/ShareButton';
import { useState, useEffect, ReactNode } from 'react';
import WhiteboardDialog, { WhiteboardDetails } from '../WhiteboardDialog/WhiteboardDialog';
import WhiteboardActionsContainer from '../containers/WhiteboardActionsContainer';
import CollaborationSettings from '../../realTimeCollaboration/CollaborationSettings/CollaborationSettings';
import { SaveRequestIndicatorIcon } from '@/domain/collaboration/realTimeCollaboration/SaveRequestIndicatorIcon';
import { useWhiteboardLastUpdatedDateQuery } from '@/core/apollo/generated/apollo-hooks';

export interface ActiveWhiteboardIdHolder {
  whiteboardId?: string;
}
export interface WhiteboardNavigationMethods {
  backToWhiteboards: () => void;
}

export interface WhiteboardViewProps extends ActiveWhiteboardIdHolder, WhiteboardNavigationMethods {
  whiteboard: WhiteboardDetails | undefined;
  authorization: { myPrivileges?: AuthorizationPrivilege[] } | undefined;
  whiteboardShareUrl: string;
  displayName?: ReactNode;
  readOnlyDisplayName?: boolean;
  loadingWhiteboards: boolean;
  preventWhiteboardDeletion?: boolean; // TODO: Temporary solution to avoid single-whiteboard callouts to lose their whiteboard
  onWhiteboardDeleted?: () => void;
}

const WhiteboardView = ({
  whiteboardId,
  whiteboard,
  authorization,
  backToWhiteboards,
  loadingWhiteboards,
  whiteboardShareUrl,
  displayName,
  readOnlyDisplayName,
  preventWhiteboardDeletion,
  onWhiteboardDeleted,
  ...whiteboardsState
}: WhiteboardViewProps) => {
  const [consecutiveSaveErrors, setConsecutiveSaveErrors] = useState<number>(0);
  const [lastSuccessfulSavedDate, setLastSuccessfulSavedDate] = useState<Date | undefined>(undefined);

  const { fullscreen, setFullscreen } = useFullscreen();

  const handleCancel = () => {
    backToWhiteboards();
    if (fullscreen) {
      setFullscreen(false);
    }
  };

  // Todo: need to decide who can edit what whiteboards, for now tie to UpdateContent. May need to extend the information on a Whiteboard
  // to include who created it etc.
  // Also to have in mind: In SingleWhiteboard Callout whiteboards, users may not have CreateWhiteboard privilege to add another whiteboard but may have privilege
  // to update an existing whiteboard
  const hasUpdatePrivileges = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);
  const hasUpdateContentPrivileges = authorization?.myPrivileges?.includes(AuthorizationPrivilege.UpdateContent);
  const hasDeletePrivileges =
    !preventWhiteboardDeletion && authorization?.myPrivileges?.includes(AuthorizationPrivilege.Delete);

  const { data: lastSaved } = useWhiteboardLastUpdatedDateQuery({
    variables: { whiteboardId: whiteboard?.id! },
    skip: !whiteboard?.id,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    // on the initialization of lastSuccessfulSavedDate take the date from the database
    if (!lastSuccessfulSavedDate && lastSaved?.lookup.whiteboard?.updatedDate) {
      setLastSuccessfulSavedDate(new Date(lastSaved?.lookup.whiteboard?.updatedDate));
    }
  }, [lastSuccessfulSavedDate, lastSaved?.lookup.whiteboard?.updatedDate]);

  return (
    <WhiteboardActionsContainer>
      {({ state: actionsState, actions }) => (
        <WhiteboardDialog
          entities={{ whiteboard }}
          lastSuccessfulSavedDate={lastSuccessfulSavedDate}
          actions={{
            onCancel: handleCancel,
            setConsecutiveSaveErrors,
            onUpdate: actions.onUpdate,
            onDelete: async () => {
              await actions.onDelete(whiteboard!);
              onWhiteboardDeleted?.();
            },
            setLastSuccessfulSavedDate,
            onChangeDisplayName: actions.onChangeDisplayName,
          }}
          options={{
            canEdit: hasUpdateContentPrivileges,
            canDelete: hasDeletePrivileges,
            show: Boolean(whiteboardId),
            dialogTitle: displayName,
            readOnlyDisplayName: readOnlyDisplayName || !hasUpdatePrivileges,
            fullscreen,
            headerActions: (
              <>
                <ShareButton url={whiteboardShareUrl} entityTypeName="whiteboard" disabled={!whiteboardShareUrl}>
                  {hasUpdatePrivileges && <CollaborationSettings element={whiteboard} elementType="whiteboard" />}
                </ShareButton>

                <FullscreenButton />

                <SaveRequestIndicatorIcon isSaved={consecutiveSaveErrors < 6} date={lastSuccessfulSavedDate} />
              </>
            ),
          }}
          state={{
            ...whiteboardsState,
            ...actionsState,
          }}
        />
      )}
    </WhiteboardActionsContainer>
  );
};

export default WhiteboardView;
