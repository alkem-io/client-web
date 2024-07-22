import { useTranslation } from 'react-i18next';
import { useMyAccountQuery } from '../../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CredentialType,
  Space,
  VirtualContributor,
} from '../../../../core/apollo/generated/graphql-schema';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import Loading from '../../../../core/ui/loading/Loading';
import { useUserContext } from '../../../../domain/community/user';
import { TopLevelRoutePath } from '../../../routing/TopLevelRoutePath';
import useNewVirtualContributorWizard from '../newVirtualContributorWizard/useNewVirtualContributorWizard';
import MyAccountBlockNoGlobalRoleUser from './MyAccountBlockNoGlobalRoleUser';
import MyAccountBlockGlobalRoleUser from './MyAccountBlockGlobalRoleUser';
import MyAccountBlockVCCampaignUser from './MyAccountBlockVCCampaignUser';

enum UserRoles {
  isNoGlobalRoleUser = 'isNoGlobalRoleUser',
  isVcCampaignUser = 'isVcCampaignUser',
  isGlobalRoleUser = 'isGlobalRoleUser',
}

export interface MyAccountVirtualContributor extends Pick<VirtualContributor, 'id'> {
  profile: {
    id: string;
    displayName: string;
    tagline: string;
    url: string;
    avatar?: {
      id: string;
      uri: string;
      name: string;
    };
  };
}

export interface MyAccountSpace extends Pick<Space, 'id' | 'level'> {
  profile: {
    id: string;
    displayName: string;
    tagline: string;
    url: string;
    avatar?: {
      id: string;
      uri: string;
      name: string;
    };
    cardBanner?: {
      id: string;
      uri: string;
      name: string;
    };
  };
  account: {
    id: string;
    host?: {
      id: string;
      nameID: string;
      profile: {
        id: string;
        displayName: string;
        tagline: string;
        url: string;
      };
    };
  };
}

const MyAccountBlock = () => {
  const { t } = useTranslation();
  const { data, loading } = useMyAccountQuery({ fetchPolicy: 'cache-and-network' });
  const { startWizard, NewVirtualContributorWizard } = useNewVirtualContributorWizard();

  // Curently displaying only the first hosted space and the first VC in it.
  const hostedSpace: MyAccountSpace | undefined = data?.me.myCreatedSpaces.filter(
    spaceData => spaceData.account && spaceData.account.host?.id === data?.me.user?.id && spaceData.level === 0
  )[0];

  const virtualContributors: MyAccountVirtualContributor[] =
    data?.me.user?.accounts
      .filter(account => account.id === hostedSpace?.account.id)
      .filter(vc => vc.virtualContributors.length > 0)[0]?.virtualContributors ?? [];

  const { user } = useUserContext();
  const userRoles: CredentialType[] | undefined = data?.me.user?.agent.credentials?.map(credential => credential.type);
  const globalRoles = [CredentialType.GlobalAdmin, CredentialType.GlobalLicenseManager, CredentialType.GlobalSupport];

  const userRole = userRoles?.includes(CredentialType.VcCampaign)
    ? UserRoles.isVcCampaignUser
    : userRoles?.some(role => globalRoles.includes(role))
    ? UserRoles.isGlobalRoleUser
    : UserRoles.isNoGlobalRoleUser;

  let createLink = t('pages.home.sections.startingSpace.url');

  if (user && user.hasPlatformPrivilege(AuthorizationPrivilege.CreateSpace)) {
    createLink = `/${TopLevelRoutePath.CreateSpace}`;
  }

  const renderMyBlock = {
    isNoGlobalRoleUser: (
      <MyAccountBlockNoGlobalRoleUser
        hostedSpace={hostedSpace}
        virtualContributors={virtualContributors}
        startWizard={startWizard}
      />
    ),
    isVcCampaignUser: (
      <MyAccountBlockVCCampaignUser
        hostedSpace={hostedSpace}
        virtualContributors={virtualContributors}
        startWizard={startWizard}
      />
    ),
    isGlobalRoleUser: (
      <MyAccountBlockGlobalRoleUser
        hostedSpace={hostedSpace}
        virtualContributors={virtualContributors}
        startWizard={startWizard}
        createLink={createLink}
      />
    ),
  };

  return (
    <PageContentBlock columns={4}>
      <PageContentBlockHeader title={t('pages.home.sections.myAccount.title')} fullWidth />
      {loading ? <Loading text="" /> : renderMyBlock[userRole]}
      <NewVirtualContributorWizard />
    </PageContentBlock>
  );
};

export default MyAccountBlock;
