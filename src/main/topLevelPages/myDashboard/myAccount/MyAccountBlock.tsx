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
  noGlobalRoleUser = 'noGlobalRoleUser',
  vcCampaignUser = 'vcCampaignUser',
  globalRoleUser = 'globalRoleUser',
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
  const hostedSpace = data?.me.myCreatedSpaces.find(
    spaceData => spaceData.account && spaceData.account.host?.id === data?.me.user?.id && spaceData.level === 0
  );

  const virtualContributors: MyAccountVirtualContributor[] =
    data?.me.user?.accounts
      .filter(account => account.id === hostedSpace?.account.id)
      .find(vc => vc.virtualContributors.length > 0)?.virtualContributors ?? [];

  const { user } = useUserContext();
  const userRoles: CredentialType[] | undefined = data?.me.user?.agent.credentials?.map(credential => credential.type);
  const globalRoles = [CredentialType.GlobalAdmin, CredentialType.GlobalLicenseManager, CredentialType.GlobalSupport];

  let userRole = UserRoles.noGlobalRoleUser;
  if (userRoles?.includes(CredentialType.VcCampaign)) {
    userRole = UserRoles.vcCampaignUser;
  } else if (userRoles?.some(role => globalRoles.includes(role))) {
    userRole = UserRoles.globalRoleUser;
  }

  let createLink = t('pages.home.sections.startingSpace.url');

  if (user && user.hasPlatformPrivilege(AuthorizationPrivilege.CreateSpace)) {
    createLink = `/${TopLevelRoutePath.CreateSpace}`;
  }

  const renderMyBlock = (userRole: UserRoles) => {
    switch (userRole) {
      case UserRoles.noGlobalRoleUser: {
        return (
          <MyAccountBlockNoGlobalRoleUser
            hostedSpace={hostedSpace}
            virtualContributors={virtualContributors}
            startWizard={startWizard}
          />
        );
      }
      case UserRoles.vcCampaignUser: {
        return (
          <MyAccountBlockVCCampaignUser
            hostedSpace={hostedSpace}
            virtualContributors={virtualContributors}
            startWizard={startWizard}
          />
        );
      }
      case UserRoles.globalRoleUser: {
        return (
          <MyAccountBlockGlobalRoleUser
            hostedSpace={hostedSpace}
            virtualContributors={virtualContributors}
            startWizard={startWizard}
            createLink={createLink}
          />
        );
      }
    }
  };

  return (
    <PageContentBlock columns={4}>
      <PageContentBlockHeader title={t('pages.home.sections.myAccount.title')} fullWidth />
      {loading ? <Loading text="" /> : renderMyBlock(userRole)}
      <NewVirtualContributorWizard />
    </PageContentBlock>
  );
};

export default MyAccountBlock;
