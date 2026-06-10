import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { BreadcrumbTrailItem } from '@/crd/components/common/BreadcrumbsTrail';
import useUserPageRouteContext from '@/main/crdPages/topLevelPages/userPages/useUserPageRouteContext';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { CrdVCCreationWizard } from './CrdVCCreationWizard';

/**
 * Full-page CRD "Create Virtual Contributor" wizard nested under a **user's**
 * settings (`/user/<slug>/settings/create-virtual-contributor` — including
 * `/user/me/...` and another user's account when viewed by a platform admin).
 * Sets the user-settings breadcrumb trail; the wizard body is shared with the
 * organization variant.
 */
export const CrdVCCreationWizardPage = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const { userModel, profileUrl } = useUserPageRouteContext();
  const displayName = userModel?.profile?.displayName ?? '';

  // Mirror the user account tab's trail (My user › Settings › Account) and append the wizard.
  const breadcrumbItems: BreadcrumbTrailItem[] =
    displayName && profileUrl
      ? [
          { label: displayName, href: profileUrl, icon: User },
          { label: t('breadcrumbs.settings'), href: `${profileUrl}/settings` },
          { label: t('shell.tabs.user.account'), href: `${profileUrl}/settings/account` },
          { label: t('wizard.title') },
        ]
      : [];
  useSetBreadcrumbs(breadcrumbItems);

  return <CrdVCCreationWizard />;
};

export default CrdVCCreationWizardPage;
