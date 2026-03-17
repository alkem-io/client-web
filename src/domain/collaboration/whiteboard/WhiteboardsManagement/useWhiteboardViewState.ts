import { useEffect, useState } from 'react';
import { useWhiteboardLastUpdatedDateQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useWhiteboardActions from '../containers/useWhiteboardActions';
import useWhiteboardGuestAccess from '../hooks/useWhiteboardGuestAccess';
import { buildGuestShareUrl } from '../utils/buildGuestShareUrl';
import type { WhiteboardDetails } from '../WhiteboardDialog/WhiteboardDialog';

interface UseWhiteboardViewStateParams {
  whiteboard: WhiteboardDetails | undefined;
  authorization: { myPrivileges?: AuthorizationPrivilege[] } | undefined;
  guestShareUrl?: string;
  preventWhiteboardDeletion?: boolean;
}

export const useWhiteboardViewState = ({
  whiteboard,
  authorization,
  guestShareUrl,
  preventWhiteboardDeletion,
}: UseWhiteboardViewStateParams) => {
  const [lastSuccessfulSavedDate, setLastSuccessfulSavedDate] = useState<Date | undefined>(undefined);

  const hasUpdatePrivileges = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);
  const hasUpdateContentPrivileges = authorization?.myPrivileges?.includes(AuthorizationPrivilege.UpdateContent);
  const hasDeletePrivileges =
    !preventWhiteboardDeletion && authorization?.myPrivileges?.includes(AuthorizationPrivilege.Delete);
  const hasPublicSharePrivilege =
    whiteboard?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.PublicShare) ?? false;

  const computedGuestShareUrl = guestShareUrl ?? buildGuestShareUrl(whiteboard?.id ?? whiteboard?.nameID);
  const guestAccess = useWhiteboardGuestAccess({ whiteboard, guestShareUrl: computedGuestShareUrl });

  const { data: lastSaved } = useWhiteboardLastUpdatedDateQuery({
    variables: { whiteboardId: whiteboard?.id ?? '' },
    skip: !whiteboard?.id,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (!lastSuccessfulSavedDate && lastSaved?.lookup.whiteboard?.updatedDate) {
      setLastSuccessfulSavedDate(new Date(lastSaved?.lookup.whiteboard?.updatedDate));
    }
  }, [lastSuccessfulSavedDate, lastSaved?.lookup.whiteboard?.updatedDate]);

  const { state: actionsState, actions } = useWhiteboardActions();

  return {
    lastSuccessfulSavedDate,
    setLastSuccessfulSavedDate,
    hasUpdatePrivileges,
    hasUpdateContentPrivileges,
    hasDeletePrivileges,
    hasPublicSharePrivilege,
    guestAccess,
    actionsState,
    actions,
  };
};
