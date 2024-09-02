import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { BlockTitle } from '../../../../../core/ui/typography';
import JourneyCardHorizontal, {
  JourneyCardHorizontalSkeleton,
} from '../../../../journey/common/JourneyCardHorizontal/JourneyCardHorizontal';
import Gutters from '../../../../../core/ui/grid/Gutters';
import ContributorCardHorizontal from '../../../../../core/ui/card/ContributorCardHorizontal';
import InnovationPackCardHorizontal, {
  InnovationPackCardHorizontalSkeleton,
} from '../../../../collaboration/InnovationPack/InnovationPackCardHorizontal/InnovationPackCardHorizontal';
import InnovationHubCardHorizontal, {
  InnovationHubCardHorizontalSkeleton,
} from '../../../../innovationHub/InnovationHubCardHorizontal/InnovationHubCardHorizontal';
import { Actions } from '../../../../../core/ui/actions/Actions';
import RoundedIcon from '../../../../../core/ui/icon/RoundedIcon';
import CreateSpaceDialog from '../../../../journey/space/createSpace/CreateSpaceDialog';
import useNewVirtualContributorWizard from '../../../../../main/topLevelPages/myDashboard/newVirtualContributorWizard/useNewVirtualContributorWizard';
import CreateInnovationPackDialog from '../../templates/InnovationPacks/admin/CreateInnovationPackDialog';
import CreateInnovationHubDialog from '../../../../innovationHub/CreateInnovationHub/CreateInnovationHubDialog';
import {
  AuthorizationPrivilege,
  SpaceType,
  SpaceVisibility,
} from '../../../../../core/apollo/generated/graphql-schema';
import { VIRTUAL_CONTRIBUTORS_LIMIT } from '../../../../../main/topLevelPages/myDashboard/myAccount/MyAccountBlockVCCampaignUser';
import MenuItemWithIcon from '../../../../../core/ui/menu/MenuItemWithIcon';
import { DeleteOutline } from '@mui/icons-material';
import { useDeleteSpaceMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import SpaceProfileDeleteDialog from '../../../../journey/space/pages/SpaceSettings/SpaceProfileDeleteDialog';

export const SPACE_COUNT_LIMIT = 3;

interface AccountProfile {
  id: string;
  displayName: string;
  description?: string;
  avatar?: { uri: string };
  url: string;
}

export interface ContributorAccountViewProps {
  accountHostName?: string;
  loading?: boolean;
  account?: {
    id: string;
    authorization?: { myPrivileges?: AuthorizationPrivilege[] };
    spaces: {
      id: string;
      level: number;
      profile: AccountProfile & {
        cardBanner?: { uri: string };
        tagline: string;
      };
      community: { id: string };
      subspaces: {
        id: string;
        profile: AccountProfile & {
          cardBanner?: { uri: string };
        };
        community: { id: string };
        type: SpaceType;
      }[];
    }[];
    virtualContributors: {
      profile: AccountProfile & {
        tagline: string;
      };
    }[];
    innovationPacks: {
      profile: AccountProfile;
      templates?: {
        calloutTemplatesCount: number;
        communityGuidelinesTemplatesCount: number;
        innovationFlowTemplatesCount: number;
        postTemplatesCount: number;
        whiteboardTemplatesCount: number;
      };
    }[];
    innovationHubs: {
      profile: AccountProfile & {
        banner?: { uri: string };
      };
      spaceVisibilityFilter?: SpaceVisibility;
      spaceListFilter?: {
        id: string;
        profile: {
          displayName: string;
        };
      }[];
      subdomain: string;
    }[];
  };
}

const useStyles = makeStyles(() => ({
  gutters: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
}));

export const ContributorAccountView: FC<ContributorAccountViewProps> = ({ accountHostName, account, loading }) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { startWizard, NewVirtualContributorWizard } = useNewVirtualContributorWizard();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const styles = useStyles();

  const { virtualContributors, innovationPacks, innovationHubs } = useMemo(
    () => ({
      virtualContributors: account?.virtualContributors ?? [],
      innovationPacks: account?.innovationPacks ?? [],
      innovationHubs: account?.innovationHubs ?? [],
    }),
    [account]
  );

  const privileges = account?.authorization?.myPrivileges ?? [];
  const isPlatformAdmin = privileges.includes(AuthorizationPrivilege.PlatformAdmin);

  const isSpaceLimitReached = (account?.spaces?.length ?? 0) >= SPACE_COUNT_LIMIT;
  const canCreateSpace =
    privileges.includes(AuthorizationPrivilege.CreateSpace) && (!isSpaceLimitReached || isPlatformAdmin);
  const canCreateInnovationPack = privileges.includes(AuthorizationPrivilege.CreateInnovationPack);
  const canCreateInnovationHub = privileges.includes(AuthorizationPrivilege.CreateInnovationHub);
  const isVCLimitReached = virtualContributors.length >= VIRTUAL_CONTRIBUTORS_LIMIT;
  // TODO: Move to server logic
  const canCreateVirtualContributor =
    privileges.includes(AuthorizationPrivilege.CreateVirtualContributor) && (!isVCLimitReached || isPlatformAdmin);

  const [deleteSpaceMutation, { loading: deleteSpaceLoading }] = useDeleteSpaceMutation({
    onCompleted: () => {
      setSelectedId(undefined);
      setDeleteDialogOpen(false);
      notify('Space deleted successfully!', 'success');
    },
    refetchQueries: ['AccountInformation'],
  });

  const deleteSpace = () => {
    if (!selectedId) {
      return;
    }

    deleteSpaceMutation({
      variables: {
        input: {
          ID: selectedId,
        },
      },
    });
  };

  const onDeleteSpaceClick = (spaceId: string) => {
    setSelectedId(spaceId);
    setDeleteDialogOpen(true);
  };

  const getSpaceActions = (spaceId: string) => (
    <MenuItemWithIcon
      key="delete"
      disabled={deleteSpaceLoading}
      iconComponent={DeleteOutline}
      onClick={() => onDeleteSpaceClick(spaceId)}
    >
      {t('buttons.delete')}
    </MenuItemWithIcon>
  );

  return (
    <PageContentColumn columns={12}>
      <PageContentBlock halfWidth>
        <BlockTitle>{t('pages.admin.generic.sections.account.hostedSpaces')}</BlockTitle>
        <Gutters disablePadding disableGap className={styles.gutters}>
          {loading && <JourneyCardHorizontalSkeleton />}
          {!loading &&
            account?.spaces.map(space => (
              <JourneyCardHorizontal
                key={space.id}
                journeyTypeName="space"
                journey={{ profile: space.profile, community: {} }}
                deepness={0}
                seamless
                sx={{ display: 'inline-block', maxWidth: '100%' }}
                actions={getSpaceActions(space.id)}
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
                  account={{ id: account?.id, name: accountHostName }}
                />
              )}
            </>
          )}
        </Actions>
      </PageContentBlock>
      <PageContentBlock halfWidth>
        <BlockTitle>{t('pages.admin.generic.sections.account.virtualContributors')}</BlockTitle>
        <Gutters disablePadding className={styles.gutters}>
          {loading && <JourneyCardHorizontalSkeleton />}
          {!loading && virtualContributors?.map(vc => <ContributorCardHorizontal profile={vc.profile} seamless />)}
          <Actions>
            {canCreateVirtualContributor && (
              <IconButton
                aria-label={t('common.add')}
                aria-haspopup="true"
                size="small"
                onClick={() => startWizard(account)}
              >
                <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
              </IconButton>
            )}
          </Actions>
          <NewVirtualContributorWizard />
        </Gutters>
      </PageContentBlock>
      <PageContentBlock halfWidth>
        <BlockTitle>{t('pages.admin.generic.sections.account.innovationPacks')}</BlockTitle>
        <Gutters disablePadding className={styles.gutters}>
          {loading && <InnovationPackCardHorizontalSkeleton />}
          {!loading && innovationPacks?.map(pack => <InnovationPackCardHorizontal {...pack} />)}
          <Actions>
            {canCreateInnovationPack && account?.id && <CreateInnovationPackDialog accountId={account?.id} />}
          </Actions>
        </Gutters>
      </PageContentBlock>
      <PageContentBlock halfWidth>
        <BlockTitle>{t('pages.admin.generic.sections.account.customHomepages')}</BlockTitle>
        <Gutters disablePadding className={styles.gutters}>
          {loading && <InnovationHubCardHorizontalSkeleton />}
          {!loading && innovationHubs?.map(hub => <InnovationHubCardHorizontal {...hub} />)}
          <Actions>
            {canCreateInnovationHub && account?.id && (
              <CreateInnovationHubDialog accountId={account?.id} accountHostName={accountHostName} />
            )}
          </Actions>
        </Gutters>
        {deleteDialogOpen && (
          <SpaceProfileDeleteDialog
            entity={t('common.space')}
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onDelete={deleteSpace}
            submitting={deleteSpaceLoading}
          />
        )}
      </PageContentBlock>
    </PageContentColumn>
  );
};

export default ContributorAccountView;
