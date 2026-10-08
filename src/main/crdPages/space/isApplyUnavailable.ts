import { isApplicationPending, type SpaceAboutApplyButtonProps } from '@/crd/components/space/SpaceAboutApplyButton';

/**
 * True when `SpaceAboutApplyButton` would only render its disabled "applications not
 * available" fallback — the user is signed in but there is nothing to join, apply to,
 * accept or wait for (e.g. the community is invitation-only). Mirrors the button's
 * decision order so consumers can hide it instead of showing a dead-end state.
 */
export const isApplyUnavailable = (props: Omit<SpaceAboutApplyButtonProps, 'className'>): boolean =>
  !props.loading &&
  props.isAuthenticated &&
  !props.isMember &&
  !props.canAcceptInvitation &&
  !props.canJoinCommunity &&
  !isApplicationPending(props.applicationState) &&
  !props.canApplyToCommunity &&
  (props.isParentMember ||
    (!isApplicationPending(props.parentApplicationState) &&
      !props.canJoinParentCommunity &&
      !props.canApplyToParentCommunity));
