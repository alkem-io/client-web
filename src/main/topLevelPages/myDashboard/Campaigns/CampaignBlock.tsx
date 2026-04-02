import { LicenseEntitlementType, RoleName } from '@/core/apollo/generated/graphql-schema';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useVirtualContributorWizard from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/useVirtualContributorWizard';
import CampaignBlockCreateVC from './CampaignBlockCreateVC';

const CampaignBlock = () => {
  const { platformRoles, accountEntitlements } = useCurrentUserContext();
  const { startWizard, virtualContributorWizard } = useVirtualContributorWizard();
  // Do not remove: Inside the blocks startWizard() is being called with a ClickEvent and that messes up with the param that startWizard expects
  const handleStartWizard = () => startWizard();

  const platfromRolesToDisplayCampaignBlockTo = [RoleName.PlatformVcCampaign];
  const entitlementsAvailableTo = [LicenseEntitlementType.AccountVirtualContributor];

  // the campaign block should be visible only for VcCampaign users ATM
  if (
    !platformRoles?.some(role => platfromRolesToDisplayCampaignBlockTo.includes(role)) ||
    !accountEntitlements?.some(entitlement => entitlementsAvailableTo.includes(entitlement))
  ) {
    return null;
  }

  return (
    <PageContentBlock>
      <CampaignBlockCreateVC startWizard={handleStartWizard} />
      {virtualContributorWizard}
    </PageContentBlock>
  );
};

export default CampaignBlock;
