import { FC, useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GuestSessionProvider } from '@/domain/collaboration/whiteboard/guestAccess/context/GuestSessionContext';
import { useGuestSession } from '@/domain/collaboration/whiteboard/guestAccess/hooks/useGuestSession';
import { useGuestWhiteboardAccess } from '@/domain/collaboration/whiteboard/guestAccess/hooks/useGuestWhiteboardAccess';
import { useGuestAnalytics } from '@/domain/collaboration/whiteboard/guestAccess/hooks/useGuestAnalytics';
import { setGuestWhiteboardUrl } from '@/domain/collaboration/whiteboard/guestAccess/utils/sessionStorage';
import { useCurrentUserFullQuery } from '@/core/apollo/generated/apollo-hooks';
import { buildSignUpUrl } from '@/main/routing/urlBuilders';
import WhiteboardDialog, {
  WhiteboardDetails,
  WhiteboardHeaderState,
} from '@/domain/collaboration/whiteboard/WhiteboardDialog/WhiteboardDialog';
import WhiteboardEmojiReactionPicker from '@/domain/collaboration/whiteboard/components/WhiteboardEmojiReactionPicker';
import { DefaultWhiteboardPreviewSettings } from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import PublicWhiteboardLayout from './PublicWhiteboardLayout';
import JoinWhiteboardDialog from './JoinWhiteboardDialog';
import PublicWhiteboardError from './PublicWhiteboardError';
import Loading from '@/core/ui/loading/Loading';
import FullscreenButton from '@/core/ui/button/FullscreenButton';
import { useFullscreen } from '@/core/ui/fullscreen/useFullscreen';
import ShareButton from '@/domain/shared/components/ShareDialog/ShareButton';
import { SaveRequestIndicatorIcon } from '@/domain/collaboration/realTimeCollaboration/SaveRequestIndicatorIcon';
import buildGuestShareUrl from '@/domain/collaboration/whiteboard/utils/buildGuestShareUrl';

/**
 * Inner component that uses guest session context
 */
const PublicWhiteboardPageContent: FC = () => {
  const { whiteboardId } = useParams<{ whiteboardId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { guestName, isDerived, setGuestName } = useGuestSession();

  // Check if user is authenticated
  // Use errorPolicy 'ignore' and context flag to prevent error toaster on public page
  const { data: currentUser, loading: userLoading } = useCurrentUserFullQuery({
    errorPolicy: 'ignore',
    context: {
      skipGlobalErrorHandler: true,
    },
  });
  const isAuthenticated = !!currentUser?.me?.user;

  const { whiteboard, loading, error, refetch, needsGuestName } = useGuestWhiteboardAccess(
    whiteboardId!,
    isAuthenticated
  );
  const { trackWhiteboardLoadSuccess, trackWhiteboardLoadFailure, trackDerivedNameUsed } = useGuestAnalytics();
  const [lastSuccessfulSavedDate, setLastSuccessfulSavedDate] = useState<Date | undefined>(undefined);
  const [consecutiveSaveErrors, setConsecutiveSaveErrors] = useState(0);
  const [previewSettingsDialogOpen, setPreviewSettingsDialogOpen] = useState<boolean>(false);
  const { fullscreen, setFullscreen } = useFullscreen();
  const { t } = useTranslation();

  const whiteboardDetails = useMemo<WhiteboardDetails | undefined>(() => {
    if (!whiteboard) return undefined;
    return {
      id: whiteboard.id,
      nameID: whiteboard.id, // Use ID as nameID for guests
      guestContributionsAllowed: whiteboard.guestContributionsAllowed,
      profile: {
        id: whiteboard.profile?.id ?? '',
        displayName: whiteboard.profile?.displayName ?? 'Whiteboard',
        storageBucket: whiteboard.profile?.storageBucket ?? { id: '' },
        url: whiteboard.profile?.url,
      },
      previewSettings: DefaultWhiteboardPreviewSettings,
    };
  }, [whiteboard]);

  const computedGuestShareUrl = useMemo(() => {
    return whiteboardDetails ? buildGuestShareUrl(whiteboardDetails.id ?? whiteboardDetails.nameID) : undefined;
  }, [whiteboardDetails]);

  // Track successful whiteboard load
  useEffect(() => {
    if (whiteboard && guestName && whiteboardId) {
      trackWhiteboardLoadSuccess(whiteboardId, guestName);
    }
  }, [whiteboard, guestName, whiteboardId, trackWhiteboardLoadSuccess]);

  // Track derived name usage (only once when first derived)
  useEffect(() => {
    if (isDerived && guestName && whiteboardId) {
      // Determine derivation method from name format
      const derivationMethod = guestName.includes(' ')
        ? 'full_name' // "FirstName L."
        : guestName.endsWith('.')
          ? 'last_only' // "L."
          : 'first_only'; // "FirstName"

      trackDerivedNameUsed(whiteboardId, guestName, derivationMethod);
    }
  }, [isDerived, guestName, whiteboardId, trackDerivedNameUsed]);

  // Track whiteboard load failure
  useEffect(() => {
    if (error && whiteboardId) {
      const errorMessage = error.message || 'Unknown error';
      trackWhiteboardLoadFailure(whiteboardId, errorMessage);
    }
  }, [error, whiteboardId, trackWhiteboardLoadFailure]);

  const handleGuestNameSubmit = (name: string) => {
    setGuestName(name);
  };

  const handleRetry = () => {
    refetch();
  };

  const handleCloseWhiteboard = useCallback(() => {
    const currentPath = location.pathname;

    if (fullscreen) {
      setFullscreen(false);
    }

    if (!isAuthenticated) {
      setGuestWhiteboardUrl(currentPath);
      navigate(buildSignUpUrl(currentPath));
    } else {
      navigate('/home');
    }
  }, [isAuthenticated, location.pathname, navigate, fullscreen, setFullscreen]);

  // Show loading state (including user authentication check)
  if (loading || userLoading) {
    return (
      <PublicWhiteboardLayout>
        <Loading />
      </PublicWhiteboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <PublicWhiteboardLayout>
        <PublicWhiteboardError error={error} onRetry={handleRetry} />
      </PublicWhiteboardLayout>
    );
  }

  // Show join dialog only for non-authenticated users who need a guest name
  if (!isAuthenticated && needsGuestName) {
    return (
      <PublicWhiteboardLayout>
        <JoinWhiteboardDialog open onSubmit={handleGuestNameSubmit} />
      </PublicWhiteboardLayout>
    );
  }

  // Treat disabled guest contributions as inaccessible whiteboard
  if (whiteboard && !whiteboard.guestContributionsAllowed) {
    return (
      <PublicWhiteboardLayout>
        <PublicWhiteboardError error={new Error('404: Guest access disabled')} />
      </PublicWhiteboardLayout>
    );
  }

  // Show whiteboard
  if (whiteboard && whiteboardDetails) {
    return (
      <WhiteboardDialog
        entities={{ whiteboard: whiteboardDetails }}
        lastSuccessfulSavedDate={lastSuccessfulSavedDate}
        actions={{
          onCancel: handleCloseWhiteboard,
          onUpdate: async () => ({ success: true }), // Read-only for guests
          onChangeDisplayName: async () => {}, // No-op for public view
          onDelete: async () => {}, // No-op for public view
          setLastSuccessfulSavedDate,
          setConsecutiveSaveErrors,
          onClosePreviewSettingsDialog: () => setPreviewSettingsDialogOpen(false),
        }}
        options={{
          show: true,
          canEdit: true, // Guests can edit via collaboration
          canDelete: false, // Guests cannot delete
          dialogTitle: whiteboard.profile?.displayName || t('pages.publicWhiteboard.fallbackTitle'),
          fullscreen,
          previewSettingsDialogOpen: previewSettingsDialogOpen,
          readOnlyDisplayName: true, // Guests cannot edit display name
          headerActions: (collabState: WhiteboardHeaderState) => (
            <>
              <ShareButton
                url={computedGuestShareUrl}
                entityTypeName="whiteboard"
                disabled={!computedGuestShareUrl}
                showShareOnAlkemio={false}
              />

              <FullscreenButton />

              <SaveRequestIndicatorIcon isSaved={consecutiveSaveErrors < 6} date={lastSuccessfulSavedDate} />

              {/* Show emoji picker for guests when they can write */}
              {collabState.mode === 'write' && (
                <WhiteboardEmojiReactionPicker
                  disabled={collabState.isReadOnly}
                  onPlacementModeChange={collabState.onEmojiPlacementModeChange}
                />
              )}
            </>
          ),
        }}
      />
    );
  }

  return null;
};

/**
 * Public whiteboard page component
 * Provides guest access to whiteboards without authentication
 */
const PublicWhiteboardPage: FC = () => {
  return (
    <GuestSessionProvider>
      <PublicWhiteboardPageContent />
    </GuestSessionProvider>
  );
};

export default PublicWhiteboardPage;
