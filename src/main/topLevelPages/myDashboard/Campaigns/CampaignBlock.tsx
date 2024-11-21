import { useCampaignBlockCredentialsQuery } from '@/core/apollo/generated/apollo-hooks';
import { CredentialType, LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import useNewVirtualContributorWizard from '../newVirtualContributorWizard/useNewVirtualContributorWizard';
import CampaignBlockCreateVC from './CampaignBlockCreateVC';

const CampaignBlock = () => {
  const { data } = useCampaignBlockCredentialsQuery({ fetchPolicy: 'cache-and-network' });
  const { startWizard, NewVirtualContributorWizard } = useNewVirtualContributorWizard();
  // Do not remove: Inside the blocks startWizard() is being called with a ClickEvent and that messes up with the param that startWizard expects
  const handleStartWizard = () => startWizard();

  const userRoles: CredentialType[] | undefined = data?.me.user?.agent.credentials?.map(credential => credential.type);
  const userEntitlements: LicenseEntitlementType[] | undefined = data?.me.user?.account?.license?.myLicensePrivileges;
  const rolesAvailableTo = [CredentialType.VcCampaign, CredentialType.BetaTester];
  const entitlementsAvailableTo = [LicenseEntitlementType.AccountVirtualContributor];

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
