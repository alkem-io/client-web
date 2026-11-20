import { Boxes, Building2, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlatformLicensingPlansQuery } from '@/core/apollo/generated/apollo-hooks';
import { SettingsTabStrip } from '@/crd/components/contributor/settings/SettingsTabStrip';
import { LicensingAccountsList } from './LicensingAccountsList';
import { LicensingSpacesList } from './LicensingSpacesList';

type LicensingTab = 'spaces' | 'organizations' | 'users';

/**
 * `/admin/licensing` — the Platform License Manager's section (027 R-F.3,
 * `licensing-section-design.md`, prototype A). Three sub-tabs, one per
 * licensee kind, each the shared admin table with the plan dialog that the
 * Spaces / Organizations / Users sections already carry, plus inline
 * visibility on Spaces. Rows are otherwise read-only: no delete, no settings,
 * no admin links, and never an email.
 */
const CrdAdminLicensingPage = () => {
  const { t } = useTranslation('crd-admin');
  const [tab, setTab] = useState<LicensingTab>('spaces');
  const { data: plansData } = usePlatformLicensingPlansQuery({ fetchPolicy: 'cache-first' });
  const plans = plansData?.platform.licensingFramework.plans ?? [];
  const licensingId = plansData?.platform.licensingFramework.id ?? '';

  const tabs = [
    { id: 'spaces' as const, label: t('licensing.tabs.spaces'), icon: Boxes },
    { id: 'organizations' as const, label: t('licensing.tabs.organizations'), icon: Building2 },
    { id: 'users' as const, label: t('licensing.tabs.users'), icon: Users },
  ];

  return (
    <div className="flex flex-col gap-6">
      <SettingsTabStrip<LicensingTab>
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        className="border-b border-border"
      />
      {tab === 'spaces' && <LicensingSpacesList plans={plans} />}
      {tab === 'organizations' && (
        <LicensingAccountsList kind="organizations" plans={plans} licensingId={licensingId} />
      )}
      {tab === 'users' && <LicensingAccountsList kind="users" plans={plans} licensingId={licensingId} />}
    </div>
  );
};

export default CrdAdminLicensingPage;
