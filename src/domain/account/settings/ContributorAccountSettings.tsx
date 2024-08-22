import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from '@mui/material';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../core/ui/content/PageContentBlock';
import { BlockTitle } from '../../../core/ui/typography';
import JourneyCardHorizontal, {
  JourneyCardHorizontalSkeleton,
} from '../../journey/common/JourneyCardHorizontal/JourneyCardHorizontal';
import Gutters from '../../../core/ui/grid/Gutters';
import ContributorCardHorizontal from '../../../core/ui/card/ContributorCardHorizontal';
import InnovationPackCardHorizontal, {
  InnovationPackCardHorizontalSkeleton,
} from '../../collaboration/InnovationPack/InnovationPackCardHorizontal/InnovationPackCardHorizontal';
import InnovationHubCardHorizontal, {
  InnovationHubCardHorizontalSkeleton,
} from '../../innovationHub/InnovationHubCardHorizontal/InnovationHubCardHorizontal';
import { Actions } from '../../../core/ui/actions/Actions';
import RoundedIcon from '../../../core/ui/icon/RoundedIcon';
import CreateSpaceDialog from '../../journey/space/createSpace/CreateSpaceDialog';
import useNewVirtualContributorWizard from '../../../main/topLevelPages/myDashboard/newVirtualContributorWizard/useNewVirtualContributorWizard';
import CreateInnovationPackDialog from '../../platform/admin/templates/InnovationPacks/admin/CreateInnovationPackDialog';
import CreateInnovationHubDialog from '../../innovationHub/CreateInnovationHub/CreateInnovationHubDialog';
import { AuthorizationPrivilege } from '../../../core/apollo/generated/graphql-schema';
import { useAccountInformationQuery } from '../../../core/apollo/generated/apollo-hooks';
import { VIRTUAL_CONTRIBUTORS_LIMIT } from '../../../main/topLevelPages/myDashboard/myAccount/MyAccountBlockVCCampaignUser';

const SPACE_COUNT_LIMIT = 3;
export interface ContributorAccountSettingsProps {
  accountId?: string;
  accountHostName?: string;
  isMyProfile?: boolean;
  isVcCampaignUser?: boolean;
  loading?: boolean;
}

export const ContributorAccountSettings = ({
  accountId,
  accountHostName,
  isMyProfile,
  isVcCampaignUser,
  loading: loadingParent,
}: ContributorAccountSettingsProps) => {
  const { t } = useTranslation();

  const { startWizard, NewVirtualContributorWizard } = useNewVirtualContributorWizard();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data, loading: loadingAccount } = useAccountInformationQuery({
    variables: {
      accountId: accountId!,
    },
    skip: !accountId,
  });
  const account = data?.lookup.account;

  const { spaces, virtualContributors, innovationPacks, innovationHubs } = useMemo(
    () => ({
      spaces: account?.spaces ?? [],
      virtualContributors: account?.virtualContributors ?? [],
      innovationPacks: account?.innovationPacks ?? [],
      innovationHubs: account?.innovationHubs ?? [],
    }),
    [account]
  );

  const privileges = account?.authorization?.myPrivileges ?? [];
  const isPlatformAdmin = privileges.includes(AuthorizationPrivilege.PlatformAdmin);

  const isSpaceLimitReached = spaces.length >= SPACE_COUNT_LIMIT;

  // TODO: move to server logic
  const canCreateSpace =
    privileges.includes(AuthorizationPrivilege.CreateSpace) && (!isSpaceLimitReached || isPlatformAdmin);
  const canCreateInnovationPack = privileges.includes(AuthorizationPrivilege.CreateInnovationPack);
  const canCreateInnovationHub = privileges.includes(AuthorizationPrivilege.CreateInnovationHub);
  const isVCLimitReached = virtualContributors.length >= VIRTUAL_CONTRIBUTORS_LIMIT;
  const canCreateVirtualContributor = isMyProfile && ((isVcCampaignUser && !isVCLimitReached) || isPlatformAdmin);

  const loading = loadingAccount || loadingParent;

  return (
    <PageContentColumn columns={12}>
      <PageContentBlock halfWidth>
        <BlockTitle>{t('pages.admin.generic.sections.account.hostedSpaces')}</BlockTitle>
        <Gutters disablePadding disableGap>
          {loading && <JourneyCardHorizontalSkeleton />}
          {!loading &&
            spaces.map(space => (
              <JourneyCardHorizontal
                key={space.id}
                journeyTypeName="space"
                journey={space}
                deepness={0}
                seamless
                sx={{ display: 'inline-block', maxWidth: '100%' }}
              />
            ))}
        </Gutters>
        <Actions>
          {canCreateSpace && (
            <>
              <IconButton
                aria-label={t('common.add')}
                aria-haspopup="true"
                size="small"
                onClick={() => setCreateDialogOpen(true)}
              >
                <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
              </IconButton>
              {createDialogOpen && (
                <CreateSpaceDialog
                  redirectOnComplete={false}
                  onClose={() => setCreateDialogOpen(false)}
                  account={{ id: accountId, name: accountHostName }}
                />
              )}
            </>
          )}
        </Actions>
      </PageContentBlock>
      <PageContentBlock halfWidth>
        <BlockTitle>{t('pages.admin.generic.sections.account.virtualContributors')}</BlockTitle>
        <Gutters disablePadding>
          {loading && <JourneyCardHorizontalSkeleton />}
          {!loading &&
            virtualContributors?.map(vc => <ContributorCardHorizontal key={vc.id} profile={vc.profile} seamless />)}
          <Actions>
            {canCreateVirtualContributor && (
              <IconButton aria-label={t('common.add')} aria-haspopup="true" size="small" onClick={startWizard}>
                <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
              </IconButton>
            )}
          </Actions>
          <NewVirtualContributorWizard />
        </Gutters>
      </PageContentBlock>
      <PageContentBlock halfWidth>
        <BlockTitle>{t('pages.admin.generic.sections.account.innovationPacks')}</BlockTitle>
        {loading && <InnovationPackCardHorizontalSkeleton />}
        {!loading && innovationPacks?.map(pack => <InnovationPackCardHorizontal key={pack.id} {...pack} />)}
        <Actions>
          {canCreateInnovationPack && accountId && <CreateInnovationPackDialog accountId={accountId} />}
        </Actions>
      </PageContentBlock>
      <PageContentBlock halfWidth>
        <BlockTitle>{t('pages.admin.generic.sections.account.customHomepages')}</BlockTitle>
        {loading && <InnovationHubCardHorizontalSkeleton />}
        {!loading && innovationHubs?.map(hub => <InnovationHubCardHorizontal key={hub.id} {...hub} />)}
        <Actions>
          {canCreateInnovationHub && accountId && (
            <CreateInnovationHubDialog accountId={accountId} accountHostName={accountHostName} />
          )}
        </Actions>
      </PageContentBlock>
    </PageContentColumn>
  );
};

export default ContributorAccountSettings;
