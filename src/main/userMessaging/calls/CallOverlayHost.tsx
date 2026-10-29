import type { MatrixClient } from 'matrix-js-sdk';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isAppMode } from '@/core/appMode/isAppMode';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { CallOverlay } from '@/crd/components/call/CallOverlay';
import { getCallConfig } from './callConfig';
import { closeCall, useCallOverlay } from './callOverlayStore';
import { useRoomCallSession } from './useRoomCallSession';
import { buildElementCallWidgetUrl, ELEMENT_CALL_LICENSE_PAGE } from './widgetUrl';

// The widget API and its driver load only when a call opens.
const CallWidgetFrame = lazyWithGlobalErrorHandler(() => import('./CallWidgetFrame'));

/**
 * Hosts this tab's call above every page. Mounted at the root, so the call
 * survives navigation and closing the chat panel. The call ends with its own
 * hang-up, a confirmed close, or the platform's chat session going away
 * (sign-out or a replaced session) — the call was made with that session.
 */
export const CallOverlayHost = () => {
  const { t, i18n } = useTranslation('crd-chat');
  const session = useCallOverlay();
  const client = useMatrixClient();
  const { isJoinedHere } = useRoomCallSession(session?.matrixRoomId ?? null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const hangupRef = useRef<(() => Promise<void>) | null>(null);
  const ownerRef = useRef<{ widgetId: string; client: MatrixClient } | null>(null);

  useEffect(() => {
    if (!session) {
      ownerRef.current = null;
      setConfirmOpen(false);
      return;
    }
    if (!client) {
      closeCall(session.widgetId);
      return;
    }
    if (ownerRef.current?.widgetId !== session.widgetId) {
      ownerRef.current = { widgetId: session.widgetId, client };
    } else if (ownerRef.current.client !== client) {
      closeCall(session.widgetId);
    }
  }, [session, client]);

  if (!session || !client) {
    return null;
  }

  const requestClose = () => {
    if (isJoinedHere) {
      setConfirmOpen(true);
    } else {
      closeCall(session.widgetId);
    }
  };

  const leaveAndClose = async () => {
    setConfirmOpen(false);
    await hangupRef.current?.();
    closeCall(session.widgetId);
  };

  const src = buildElementCallWidgetUrl({
    widgetId: session.widgetId,
    parentOrigin: window.location.origin,
    matrixRoomId: session.matrixRoomId,
    userId: client.getUserId() ?? '',
    deviceId: client.getDeviceId() ?? '',
    baseUrl: client.baseUrl,
    intent: session.intent,
    lang: i18n.language,
  });

  return (
    <CallOverlay
      open={true}
      label={t('call.overlayLabel')}
      closeLabel={t('call.close')}
      onRequestClose={requestClose}
      // The app's WebView has no second window: a new-tab link to the platform's own origin
      // would replace the page and end the call, so the app shows no license link.
      licenseHref={isAppMode() ? undefined : ELEMENT_CALL_LICENSE_PAGE}
      licenseLabel={t('call.license')}
      licenseNewTabLabel={t('call.opensInNewTab')}
      confirm={{
        open: confirmOpen,
        title: t('call.leaveConfirm.title'),
        description: t('call.leaveConfirm.description'),
        confirmLabel: t('call.leaveConfirm.confirm'),
        cancelLabel: t('call.leaveConfirm.cancel'),
        onConfirm: () => {
          void leaveAndClose();
        },
        onCancel: () => setConfirmOpen(false),
      }}
    >
      <Suspense fallback={null}>
        <CallWidgetFrame
          key={session.widgetId}
          widgetId={session.widgetId}
          src={src}
          title={t('call.overlayLabel')}
          client={client}
          matrixRoomId={session.matrixRoomId}
          livekitServiceUrl={getCallConfig().livekitServiceUrl}
          hangupRef={hangupRef}
        />
      </Suspense>
    </CallOverlay>
  );
};
