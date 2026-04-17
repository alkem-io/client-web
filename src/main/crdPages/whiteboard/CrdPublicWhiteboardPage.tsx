import { type FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCurrentUserLightQuery } from '@/core/apollo/generated/apollo-hooks';
import FullscreenButton from '@/core/ui/button/FullscreenButton';
import { useFullscreen } from '@/core/ui/fullscreen/useFullscreen';
import { useScreenSize } from '@/core/ui/grid/constants';
import { Loading } from '@/crd/components/common/Loading';
import { ShareButton } from '@/crd/components/common/ShareButton';
import { JoinWhiteboardDialog } from '@/crd/components/whiteboard/JoinWhiteboardDialog';
import { WhiteboardErrorState } from '@/crd/components/whiteboard/WhiteboardErrorState';
import { SaveRequestIndicatorIcon } from '@/domain/collaboration/realTimeCollaboration/SaveRequestIndicatorIcon';
import { GuestSessionProvider } from '@/domain/collaboration/whiteboard/guestAccess/context/GuestSessionContext';
import { useGuestAnalytics } from '@/domain/collaboration/whiteboard/guestAccess/hooks/useGuestAnalytics';
import { useGuestSession } from '@/domain/collaboration/whiteboard/guestAccess/hooks/useGuestSession';
import { useGuestWhiteboardAccess } from '@/domain/collaboration/whiteboard/guestAccess/hooks/useGuestWhiteboardAccess';
import { validateGuestName } from '@/domain/collaboration/whiteboard/guestAccess/utils/guestNameValidator';
import { setGuestWhiteboardUrl } from '@/domain/collaboration/whiteboard/guestAccess/utils/sessionStorage';
import buildGuestShareUrl from '@/domain/collaboration/whiteboard/utils/buildGuestShareUrl';
import { DefaultWhiteboardPreviewSettings } from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import { buildLoginUrl, buildSignUpUrl } from '@/main/routing/urlBuilders';
import CrdWhiteboardDialog from './CrdWhiteboardDialog';

const CrdPublicWhiteboardPageContent: FC = () => {
  const { whiteboardId } = useParams<{ whiteboardId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { guestName, isDerived, setGuestName } = useGuestSession();
  const { t } = useTranslation('crd-whiteboard');

  const { data: currentUser, loading: userLoading } = useCurrentUserLightQuery({
    errorPolicy: 'ignore',
    context: { skipGlobalErrorHandler: true },
  });
  const isAuthenticated = !!currentUser?.me?.user;

  const { whiteboard, loading, error, refetch, needsGuestName } = useGuestWhiteboardAccess(
    whiteboardId,
    isAuthenticated
  );
  const { trackWhiteboardLoadSuccess, trackWhiteboardLoadFailure, trackDerivedNameUsed } = useGuestAnalytics();
  const [lastSuccessfulSavedDate, setLastSuccessfulSavedDate] = useState<Date | undefined>(undefined);
  const [consecutiveSaveErrors, setConsecutiveSaveErrors] = useState(0);
  const [previewSettingsDialogOpen, setPreviewSettingsDialogOpen] = useState(false);
  const { isSmallScreen } = useScreenSize();
  const { fullscreen, setFullscreen } = useFullscreen();
  const isFullscreen = fullscreen || isSmallScreen;

  const whiteboardDetails = (() => {
    if (!whiteboard) return undefined;
    return {
      id: whiteboard.id,
      nameID: whiteboard.id,
      guestContributionsAllowed: whiteboard.guestContributionsAllowed,
      profile: {
        id: whiteboard.profile?.id ?? '',
        displayName: whiteboard.profile?.displayName ?? t('editor.untitled'),
        storageBucket: whiteboard.profile?.storageBucket ?? { id: '' },
        url: whiteboard.profile?.url,
      },
      previewSettings: DefaultWhiteboardPreviewSettings,
    };
  })();

  const computedGuestShareUrl = whiteboardDetails
    ? buildGuestShareUrl(whiteboardDetails.id ?? whiteboardDetails.nameID)
    : undefined;

  useEffect(() => {
    if (whiteboard && guestName && whiteboardId) {
      trackWhiteboardLoadSuccess(whiteboardId, guestName);
    }
  }, [whiteboard, guestName, whiteboardId, trackWhiteboardLoadSuccess]);

  useEffect(() => {
    if (isDerived && guestName && whiteboardId) {
      const derivationMethod = guestName.includes(' ')
        ? 'full_name'
        : guestName.endsWith('.')
          ? 'last_only'
          : 'first_only';
      trackDerivedNameUsed(whiteboardId, guestName, derivationMethod);
    }
  }, [isDerived, guestName, whiteboardId, trackDerivedNameUsed]);

  useEffect(() => {
    if (error && whiteboardId) {
      trackWhiteboardLoadFailure(whiteboardId, error.message || 'Unknown error');
    }
  }, [error, whiteboardId, trackWhiteboardLoadFailure]);

  const handleGuestNameSubmit = (name: string) => {
    setGuestName(name);
  };

  const handleSignIn = () => {
    navigate(buildLoginUrl(location.pathname));
  };

  const handleCloseWhiteboard = () => {
    if (fullscreen) {
      setFullscreen(false);
    }
    if (!isAuthenticated) {
      setGuestWhiteboardUrl(location.pathname);
      navigate(buildSignUpUrl(location.pathname));
    } else {
      navigate('/home');
    }
  };

  const getErrorInfo = (err: Error) => {
    const msg = err.message.toLowerCase();
    if (
      msg.includes('404') ||
      msg.includes('not found') ||
      msg.includes('403') ||
      msg.includes('forbidden') ||
      msg.includes('not available')
    ) {
      return { title: t('error.notFound.title'), message: t('error.notFound.message') };
    }
    return { title: t('error.serverError.title'), message: t('error.serverError.message') };
  };

  if (loading || userLoading) {
    return (
      <div className="w-screen h-screen overflow-hidden relative">
        <Loading />
      </div>
    );
  }

  if (error) {
    const { title, message } = getErrorInfo(error);
    return (
      <div className="w-screen h-screen overflow-hidden relative">
        <WhiteboardErrorState title={title} message={message} onRetry={() => refetch()} />
      </div>
    );
  }

  if (!isAuthenticated && needsGuestName) {
    return (
      <div className="w-screen h-screen overflow-hidden relative">
        <JoinWhiteboardDialog
          open={true}
          onSubmit={handleGuestNameSubmit}
          onSignIn={handleSignIn}
          validate={name => {
            const v = validateGuestName(name);
            return v.valid ? undefined : v.error;
          }}
        />
      </div>
    );
  }

  if (whiteboard && !whiteboard.guestContributionsAllowed) {
    return (
      <div className="w-screen h-screen overflow-hidden relative">
        <WhiteboardErrorState title={t('error.notFound.title')} message={t('error.notFound.message')} />
      </div>
    );
  }

  if (whiteboard && whiteboardDetails) {
    return (
      <CrdWhiteboardDialog
        entities={{ whiteboard: whiteboardDetails }}
        lastSuccessfulSavedDate={lastSuccessfulSavedDate}
        actions={{
          onCancel: handleCloseWhiteboard,
          onUpdate: async () => ({ success: true }),
          onChangeDisplayName: async () => {},
          onDelete: async () => {},
          setLastSuccessfulSavedDate,
          setConsecutiveSaveErrors,
          onClosePreviewSettingsDialog: () => setPreviewSettingsDialogOpen(false),
        }}
        options={{
          show: true,
          canEdit: true,
          canDelete: false,
          dialogTitle: whiteboard.profile?.displayName || t('editor.untitled'),
          fullscreen: isFullscreen,
          previewSettingsDialogOpen,
          readOnlyDisplayName: true,
          headerActions: () => (
            <>
              <ShareButton url={computedGuestShareUrl} disabled={!computedGuestShareUrl} showShareOnAlkemio={false} />
              {!isSmallScreen && <FullscreenButton />}
              <SaveRequestIndicatorIcon isSaved={consecutiveSaveErrors < 6} date={lastSuccessfulSavedDate} />
            </>
          ),
        }}
      />
    );
  }

  return null;
};

const CrdPublicWhiteboardPage: FC = () => {
  return (
    <GuestSessionProvider>
      <CrdPublicWhiteboardPageContent />
    </GuestSessionProvider>
  );
};

export default CrdPublicWhiteboardPage;
