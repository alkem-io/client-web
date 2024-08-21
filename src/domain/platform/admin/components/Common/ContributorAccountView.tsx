import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from '@mui/material';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { BlockTitle } from '../../../../../core/ui/typography';
import JourneyCardHorizontal, {
  JourneyCardHorizontalProps,
  JourneyCardHorizontalSkeleton,
} from '../../../../journey/common/JourneyCardHorizontal/JourneyCardHorizontal';
import Gutters from '../../../../../core/ui/grid/Gutters';
import ContributorCardHorizontal, {
  ContributorCardHorizontalProps,
} from '../../../../../core/ui/card/ContributorCardHorizontal';
import InnovationPackCardHorizontal, {
  InnovationPackCardHorizontalProps,
  InnovationPackCardHorizontalSkeleton,
} from '../../../../collaboration/InnovationPack/InnovationPackCardHorizontal/InnovationPackCardHorizontal';
import InnovationHubCardHorizontal, {
  InnovationHubCardHorizontalProps,
  InnovationHubCardHorizontalSkeleton,
} from '../../../../innovationHub/InnovationHubCardHorizontal/InnovationHubCardHorizontal';
import { Actions } from '../../../../../core/ui/actions/Actions';
import RoundedIcon from '../../../../../core/ui/icon/RoundedIcon';
import CreateSpaceDialog from '../../../../journey/space/createSpace/CreateSpaceDialog';
import useNewVirtualContributorWizard from '../../../../../main/topLevelPages/myDashboard/newVirtualContributorWizard/useNewVirtualContributorWizard';
import CreateInnovationPackDialog from '../../templates/InnovationPacks/admin/CreateInnovationPackDialog';
import CreateInnovationHubDialog from '../../../../innovationHub/CreateInnovationHub/CreateInnovationHubDialog';

export interface ContributorAccountViewProps {
  accountId?: string;
  accountHostName?: string;
  spaces: JourneyCardHorizontalProps['journey'][];
  virtualContributors: ContributorCardHorizontalProps[];
  innovationPacks: InnovationPackCardHorizontalProps[];
  innovationHubs: InnovationHubCardHorizontalProps[];
  loading?: boolean;
  spacesLoading?: boolean;
  canCreateSpace?: boolean;
  canCreateVirtualContributor?: boolean;
  canCreateInnovationPack?: boolean;
  canCreateInnovationHub?: boolean;
}

export const ContributorAccountView = ({
  accountId,
  accountHostName,
  spaces,
  virtualContributors,
  innovationPacks,
  innovationHubs,
  loading,
  spacesLoading,
  canCreateSpace,
  canCreateVirtualContributor,
  canCreateInnovationPack,
  canCreateInnovationHub,
}: ContributorAccountViewProps) => {
  const { t } = useTranslation();
  const { startWizard, NewVirtualContributorWizard } = useNewVirtualContributorWizard();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <PageContentColumn columns={12}>
      <PageContentBlock halfWidth>
        <BlockTitle>{t('pages.admin.generic.sections.account.hostedSpaces')}</BlockTitle>
        <Gutters disablePadding disableGap>
          {spacesLoading && <JourneyCardHorizontalSkeleton />}
          {!spacesLoading &&
            spaces.map(space => (
              <JourneyCardHorizontal
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
          {!loading && virtualContributors?.map(vc => <ContributorCardHorizontal profile={vc.profile} seamless />)}
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
        {!loading && innovationPacks?.map(pack => <InnovationPackCardHorizontal {...pack} />)}
        <Actions>
          {canCreateInnovationPack && accountId && <CreateInnovationPackDialog accountId={accountId} />}
        </Actions>
      </PageContentBlock>
      <PageContentBlock halfWidth>
        <BlockTitle>{t('pages.admin.generic.sections.account.customHomepages')}</BlockTitle>
        {loading && <InnovationHubCardHorizontalSkeleton />}
        {!loading && innovationHubs?.map(hub => <InnovationHubCardHorizontal {...hub} />)}
        <Actions>
          {canCreateInnovationHub && accountId && (
            <CreateInnovationHubDialog accountId={accountId} accountHostName={accountHostName} />
          )}
        </Actions>
      </PageContentBlock>
    </PageContentColumn>
  );
};

export default ContributorAccountView;
