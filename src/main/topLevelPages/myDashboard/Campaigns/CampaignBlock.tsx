import { useCampaignBlockCredentialsQuery } from '@/core/apollo/generated/apollo-hooks';
import { LicenseEntitlementType, PlatformRole } from '@/core/apollo/generated/graphql-schema';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import useNewVirtualContributorWizard from '../newVirtualContributorWizard/useNewVirtualContributorWizard';
import CampaignBlockCreateVC from './CampaignBlockCreateVC';

const CampaignBlock = () => {
  const { data } = useCampaignBlockCredentialsQuery({ fetchPolicy: 'cache-and-network' });
  const { startWizard, NewVirtualContributorWizard } = useNewVirtualContributorWizard();
  // Do not remove: Inside the blocks startWizard() is being called with a ClickEvent and that messes up with the param that startWizard expects
  const handleStartWizard = () => startWizard();

  const userRoles: PlatformRole[] = data?.platform.myRoles ?? [];
  const userEntitlements: LicenseEntitlementType[] | undefined = data?.me.user?.account?.license?.myLicensePrivileges;
  const rolesAvailableTo = [PlatformRole.VcCampaign];
  const entitlementsAvailableTo = [LicenseEntitlementType.AccountVirtualContributor];

  // the campaign block should be visible only for VcCampaign users ATM
  if (
    !userRoles?.some(role => rolesAvailableTo.includes(role)) ||
    !userEntitlements?.some(entitlement => entitlementsAvailableTo.includes(entitlement))
  ) {
    return null;
  }

  return (
    <PageContentBlock>
      <CampaignBlockCreateVC startWizard={handleStartWizard} />
      <NewVirtualContributorWizard />
    </PageContentBlock>
  );
};

export default CampaignBlock;
