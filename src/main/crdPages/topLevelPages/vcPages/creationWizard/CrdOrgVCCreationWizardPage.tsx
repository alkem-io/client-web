import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { BreadcrumbTrailItem } from '@/crd/components/common/BreadcrumbsTrail';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { CrdVCCreationWizard } from './CrdVCCreationWizard';

/**
 * Full-page CRD "Create Virtual Contributor" wizard nested under an
 * **organization's** settings (`/organization/<slug>/settings/create-virtual-contributor`).
 * Sets the org-settings breadcrumb trail; the wizard body is shared with the
 * user variant.
 */
export const CrdOrgVCCreationWizardPage = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const { organization } = useOrganizationContext();
  const displayName = organization?.profile?.displayName ?? '';
  const profileUrl = organization?.profile?.url;

  // Mirror the org account tab's trail (Org › Settings › Account) and append the wizard.
  const breadcrumbItems: BreadcrumbTrailItem[] =
    displayName && profileUrl
      ? [
          { label: displayName, href: profileUrl, icon: Building2 },
          { label: t('breadcrumbs.settings'), href: `${profileUrl}/settings` },
          { label: t('shell.tabs.org.account'), href: `${profileUrl}/settings/account` },
          { label: t('wizard.title') },
        ]
      : [];
  useSetBreadcrumbs(breadcrumbItems);

  return <CrdVCCreationWizard />;
};

export default CrdOrgVCCreationWizardPage;
