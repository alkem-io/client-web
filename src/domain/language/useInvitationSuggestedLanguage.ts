/**
 * T012 — Reads the suggestedLanguage from the user's first pending community
 * invitation (DL-1 — tier #2 of the offer ladder).
 *
 * Only meaningful for never-chose authenticated users (account.language == null,
 * languageOfferAnswered == false). Returns null when any condition fails, when
 * no invitation carries a suggestion, or when the query is still loading.
 *
 * This value is fed into resolveOfferLanguage() where it outranks browser
 * detection (tier #4). The caller gates the offer on full eligibility checking
 * inside resolveOfferLanguage (suggestion not in eligible → ignored per FR-018).
 */

import { useUserPendingMembershipsQuery } from '@/core/apollo/generated/apollo-hooks';
import type { CurrentUserLightQuery } from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';

export function useInvitationSuggestedLanguage(): string | null {
  const { isAuthenticated, userModel } = useCurrentUserContext();

  // Cast to the CurrentUserLightQuery user shape which includes language settings fields (T001).
  type CurrentUser = NonNullable<CurrentUserLightQuery['me']['user']>;
  const userDetails = userModel as CurrentUser | undefined;

  // Only relevant for never-chose authenticated users.
  const skip =
    !isAuthenticated ||
    userDetails?.settings?.language != null ||
    userDetails?.settings?.languageOfferAnswered === true;

  const { data } = useUserPendingMembershipsQuery({
    skip,
    fetchPolicy: 'cache-first',
  });

  if (skip) return null;

  const invitations = data?.me?.communityInvitations;
  if (!invitations || invitations.length === 0) return null;

  // DL-7 / R-6: return the suggestedLanguage from the LATEST-CREATED eligible invitation
  // so the result is deterministic regardless of the server-returned array order.
  // `createdDate` is already selected in the InvitationData fragment (CurrentUserFull.graphql:37).
  const sorted = invitations
    .filter(r => r.invitation?.suggestedLanguage)
    .slice()
    .sort((a, b) => {
      const ta = a.invitation?.createdDate ? new Date(a.invitation.createdDate).getTime() : 0;
      const tb = b.invitation?.createdDate ? new Date(b.invitation.createdDate).getTime() : 0;
      return tb - ta; // descending: latest first
    });

  return sorted[0]?.invitation?.suggestedLanguage ?? null;
}
