import { useState } from 'react';
import { CalloutWhiteboardPreview } from '@/crd/components/callout/CalloutWhiteboardPreview';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import buildGuestShareUrl from '@/domain/collaboration/whiteboard/utils/buildGuestShareUrl';
import CrdWhiteboardView from '@/main/crdPages/whiteboard/CrdWhiteboardView';

type WhiteboardFramingConnectorProps = {
  callout: CalloutDetailsModelExtended;
};

export function WhiteboardFramingConnector({ callout }: WhiteboardFramingConnectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const whiteboard = callout.framing.whiteboard;

  if (!whiteboard) return null;

  const guestShareUrl = buildGuestShareUrl(whiteboard.id ?? whiteboard.nameID ?? undefined);

  return (
    <>
      <CalloutWhiteboardPreview previewUrl={whiteboard.profile.preview?.uri} onOpen={() => setIsOpen(true)} />
      {isOpen && (
        <CrdWhiteboardView
          whiteboardId={whiteboard.id}
          whiteboard={whiteboard}
          authorization={whiteboard.authorization}
          whiteboardShareUrl={callout.framing.profile.url}
          guestShareUrl={guestShareUrl}
          readOnlyDisplayName={true}
          displayName={callout.framing.profile.displayName}
          preventWhiteboardDeletion={true}
          loadingWhiteboards={false}
          backToWhiteboards={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
