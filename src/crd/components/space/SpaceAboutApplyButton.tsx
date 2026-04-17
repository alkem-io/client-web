import { Loader2, Plus, User } from 'lucide-react';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type ApplicationStateLike = string | undefined;

export type SpaceAboutApplyButtonProps = {
  isAuthenticated: boolean;
  isMember: boolean;
  isParentMember: boolean;
  applicationState?: ApplicationStateLike;
  userInvitation?: { id: string };
  parentApplicationState?: ApplicationStateLike;
  canJoinCommunity: boolean;
  canAcceptInvitation: boolean;
  canApplyToCommunity: boolean;
  canJoinParentCommunity: boolean;
  canApplyToParentCommunity: boolean;
  loading: boolean;

  onLoginClick?: () => void;
  onApplyClick?: () => void;
  onJoinClick?: () => void;
  onAcceptInvitationClick?: () => void;
  onApplyParentClick?: () => void;
  onJoinParentClick?: () => void;

  className?: string;
};

const PENDING_STATES = new Set(['new', 'archived']);
const isApplicationPending = (state: ApplicationStateLike): boolean => !!state && PENDING_STATES.has(state);

export const SpaceAboutApplyButton = forwardRef<HTMLButtonElement, SpaceAboutApplyButtonProps>(
  function SpaceAboutApplyButton(
    {
      isAuthenticated,
      isMember,
      isParentMember,
      applicationState,
      canJoinCommunity,
      canAcceptInvitation,
      canApplyToCommunity,
      canJoinParentCommunity,
      canApplyToParentCommunity,
      parentApplicationState,
      loading,
      onLoginClick,
      onApplyClick,
      onJoinClick,
      onAcceptInvitationClick,
      onApplyParentClick,
      onJoinParentClick,
      className,
    },
    ref
  ) {
    const { t } = useTranslation('crd-space');

    const button = (() => {
      if (loading) {
        return (
          <Button ref={ref} type="button" variant="default" className="w-full" disabled={true} aria-busy={true}>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          </Button>
        );
      }

      if (!isAuthenticated) {
        return (
          <Button ref={ref} type="button" variant="default" className="w-full" onClick={onLoginClick}>
            {t('about.signIn')}
          </Button>
        );
      }

      if (isMember) {
        return (
          <Button ref={ref} type="button" variant="outline" className="w-full" disabled={true} aria-disabled={true}>
            <User className="w-4 h-4" aria-hidden="true" />
            {t('about.member')}
          </Button>
        );
      }

      if (canAcceptInvitation) {
        return (
          <Button ref={ref} type="button" variant="default" className="w-full" onClick={onAcceptInvitationClick}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            {t('about.acceptInvitation')}
          </Button>
        );
      }

      if (canJoinCommunity) {
        return (
          <Button ref={ref} type="button" variant="default" className="w-full" onClick={onJoinClick}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            {t('about.join')}
          </Button>
        );
      }

      if (isApplicationPending(applicationState)) {
        return (
          <Button ref={ref} type="button" variant="outline" className="w-full" disabled={true} aria-disabled={true}>
            {t('about.applyPending')}
          </Button>
        );
      }

      if (canApplyToCommunity) {
        return (
          <Button ref={ref} type="button" variant="default" className="w-full" onClick={onApplyClick}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            {t('about.apply')}
          </Button>
        );
      }

      if (isParentMember) {
        return (
          <Button ref={ref} type="button" variant="outline" className="w-full" disabled={true} aria-disabled={true}>
            {t('about.applyDisabled')}
          </Button>
        );
      }

      if (isApplicationPending(parentApplicationState)) {
        return (
          <Button ref={ref} type="button" variant="outline" className="w-full" disabled={true} aria-disabled={true}>
            {t('about.parentPending')}
          </Button>
        );
      }

      if (canJoinParentCommunity) {
        return (
          <Button ref={ref} type="button" variant="default" className="w-full" onClick={onJoinParentClick}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            {t('about.join')}
          </Button>
        );
      }

      if (canApplyToParentCommunity) {
        return (
          <Button ref={ref} type="button" variant="default" className="w-full" onClick={onApplyParentClick}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            {t('about.apply')}
          </Button>
        );
      }

      return (
        <Button ref={ref} type="button" variant="outline" className="w-full" disabled={true} aria-disabled={true}>
          {t('about.applyDisabled')}
        </Button>
      );
    })();

    return (
      <div className={cn('w-full', className)}>
        {button}
        {!isAuthenticated && !loading && (
          <p className="text-xs text-muted-foreground mt-2 text-center">{t('about.signInHelper')}</p>
        )}
      </div>
    );
  }
);
