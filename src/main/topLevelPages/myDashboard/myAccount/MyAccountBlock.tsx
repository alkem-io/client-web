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
}

const MyAccountBlock = () => {
  const { t } = useTranslation();
  const { data, loading } = useMyAccountQuery({ fetchPolicy: 'cache-and-network' });
  const { startWizard, NewVirtualContributorWizard } = useNewVirtualContributorWizard();
  const handleStartWizard = () => startWizard(); // Do not remove: Inside the blocks startWizard() is being called with a ClickEvent and that messes up with the param that startWizard expects

  // Curently displaying only the first hosted space and the first VC in it

  const accountPrivileges = data?.me.user?.account?.authorization?.myPrivileges ?? [];
  const hostedSpace = data?.me.user?.account?.spaces?.[0];
  const virtualContributors: MyAccountVirtualContributor[] = data?.me.user?.account?.virtualContributors ?? [];

  const userRoles: CredentialType[] | undefined = data?.me.user?.agent.credentials?.map(credential => credential.type);
  const globalRoles = [CredentialType.GlobalAdmin, CredentialType.GlobalLicenseManager, CredentialType.GlobalSupport];

  let userRole = UserRoles.noGlobalRoleUser;
  if (userRoles?.includes(CredentialType.VcCampaign)) {
    userRole = UserRoles.vcCampaignUser;
  } else if (userRoles?.some(role => globalRoles.includes(role))) {
    userRole = UserRoles.globalRoleUser;
  }

  let createLink = t('pages.home.sections.startingSpace.url');

  if (accountPrivileges.includes(AuthorizationPrivilege.CreateSpace)) {
    createLink = `/${TopLevelRoutePath.CreateSpace}`;
  }

  const renderMyBlock = (userRole: UserRoles) => {
    switch (userRole) {
      case UserRoles.noGlobalRoleUser: {
        return (
          <MyAccountBlockNoGlobalRoleUser
            hostedSpace={hostedSpace}
            virtualContributors={virtualContributors}
            startWizard={handleStartWizard}
          />
        );
      }
      case UserRoles.vcCampaignUser: {
        return (
          <MyAccountBlockVCCampaignUser
            hostedSpace={hostedSpace}
            virtualContributors={virtualContributors}
            startWizard={handleStartWizard}
          />
        );
      }
      case UserRoles.globalRoleUser: {
        return (
          <MyAccountBlockGlobalRoleUser
            hostedSpace={hostedSpace}
            virtualContributors={virtualContributors}
            startWizard={handleStartWizard}
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
