import { FC, useCallback, useEffect, useState } from 'react';
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
} from '@/domain/collaboration/whiteboard/WhiteboardDialog/WhiteboardDialog';
import { DefaultWhiteboardPreviewSettings } from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import PublicWhiteboardLayout from './PublicWhiteboardLayout';
import JoinWhiteboardDialog from './JoinWhiteboardDialog';
import PublicWhiteboardError from './PublicWhiteboardError';
import Loading from '@/core/ui/loading/Loading';

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

  const { whiteboard, loading, error, refetch, needsGuestName } = useGuestWhiteboardAccess(whiteboardId!);
  const { trackWhiteboardLoadSuccess, trackWhiteboardLoadFailure, trackDerivedNameUsed } = useGuestAnalytics();
  const [lastSuccessfulSavedDate, setLastSuccessfulSavedDate] = useState<Date | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [consecutiveSaveErrors, setConsecutiveSaveErrors] = useState(0);
  const { t } = useTranslation();

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

    if (!isAuthenticated) {
      setGuestWhiteboardUrl(currentPath);
      navigate(buildSignUpUrl(currentPath));
    } else {
      navigate('/home');
    }
  }, [isAuthenticated, location.pathname, navigate]);

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

  // Show whiteboard
  if (whiteboard) {
    // Adapt public whiteboard data to WhiteboardDialog format
    const whiteboardDetails: WhiteboardDetails = {
      id: whiteboard.id,
      nameID: whiteboard.id, // Use ID as nameID for guests
      guestContributionsAllowed: whiteboard.guestContributionsAllowed,
      profile: {
        id: whiteboard.profile?.id ?? '',
        displayName: whiteboard.profile?.displayName ?? 'Whiteboard',
        storageBucket: whiteboard.profile?.storageBucket ?? { id: '' },
        url: whiteboard.profile?.url,
      },
      createdBy: whiteboard.createdBy
        ? {
            id: whiteboard.createdBy.id,
            profile: {
              displayName: whiteboard.createdBy.profile.displayName,
              url: '',
              avatar: undefined,
            },
          }
        : undefined,
      previewSettings: DefaultWhiteboardPreviewSettings,
    };

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
        }}
        options={{
          show: true,
          canEdit: true, // Guests can edit via collaboration
          canDelete: false, // Guests cannot delete
          dialogTitle: whiteboard.profile?.displayName || t('pages.publicWhiteboard.fallbackTitle'),
          fullscreen: false,
          readOnlyDisplayName: true, // Guests cannot edit display name
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
