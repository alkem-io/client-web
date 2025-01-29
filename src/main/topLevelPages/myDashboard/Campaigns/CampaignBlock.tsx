import { useCampaignBlockCredentialsQuery } from '@/core/apollo/generated/apollo-hooks';
import { LicenseEntitlementType, RoleName } from '@/core/apollo/generated/graphql-schema';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import CampaignBlockCreateVC from './CampaignBlockCreateVC';
import useVirtualContributorWizard from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/useVirtualContributorWizard';

const CampaignBlock = () => {
  const { data } = useCampaignBlockCredentialsQuery({ fetchPolicy: 'cache-and-network' });
  const { startWizard, VirtualContributorWizard } = useVirtualContributorWizard();
  // Do not remove: Inside the blocks startWizard() is being called with a ClickEvent and that messes up with the param that startWizard expects
  const handleStartWizard = () => startWizard();

  const userPlatformRoles: RoleName[] | undefined = data?.platform.roleSet.myRoles;
  const userAccountEntitlements: LicenseEntitlementType[] | undefined =
    data?.me.user?.account?.license?.availableEntitlements;
  const platfromRolesToDisplayCampaignBlockTo = [RoleName.PlatformVcCampaign];
  const entitlementsAvailableTo = [LicenseEntitlementType.AccountVirtualContributor];

  // the campaign block should be visible only for VcCampaign users ATM
  if (
    !userPlatformRoles?.some(role => platfromRolesToDisplayCampaignBlockTo.includes(role)) ||
    !userAccountEntitlements?.some(entitlement => entitlementsAvailableTo.includes(entitlement))
  ) {
    return null;
  }

  return (
    <PageContentBlock>
      <CampaignBlockCreateVC startWizard={handleStartWizard} />
      <VirtualContributorWizard />
    </PageContentBlock>
  );
};

export default CampaignBlock;
