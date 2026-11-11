import { useState } from 'react';
import { useSecondFactorRequirementQuery } from '@/core/apollo/generated/apollo-hooks';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { buildSettingsTabUrl } from '@/main/routing/urlBuilders';

export const SECOND_FACTOR_REMINDER_DISMISSED_KEY = 'alkemio_second_factor_reminder_dismissed';

/**
 * The reminder shown while a rule requires a second factor the person has not
 * set up and its deadline is still ahead. Dismissed for the rest of the browser
 * session. A refused session asks nothing: it is on its way to /second-factor.
 */
export function useSecondFactorReminder() {
  const { isAuthenticated, secondFactorRequired } = useAuthenticationContext();
  const { userModel } = useCurrentUserContext();
  const { data } = useSecondFactorRequirementQuery({ skip: !isAuthenticated || secondFactorRequired });
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(SECOND_FACTOR_REMINDER_DISMISSED_KEY) === 'true'
  );

  const requirement = data?.me.secondFactorRequirement;
  const deadline = requirement?.deadline ? new Date(requirement.deadline) : undefined;
  const securityHref = buildSettingsTabUrl(userModel?.profile?.url, 'security', 'two-step-verification');
  const visible =
    !secondFactorRequired &&
    !dismissed &&
    Boolean(requirement?.covered && !requirement.satisfied) &&
    deadline !== undefined &&
    deadline.getTime() > Date.now() &&
    Boolean(securityHref);

  const dismiss = () => {
    sessionStorage.setItem(SECOND_FACTOR_REMINDER_DISMISSED_KEY, 'true');
    setDismissed(true);
  };

  return { visible, deadline, securityHref, dismiss };
}
