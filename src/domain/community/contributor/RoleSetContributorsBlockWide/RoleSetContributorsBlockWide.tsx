import { useCallback, useState } from 'react';
import { ContributorCardSquareProps } from '../ContributorCardSquare/ContributorCardSquare';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeaderWithDialogAction from '@/core/ui/content/PageContentBlockHeaderWithDialogAction';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { Box, ButtonBase } from '@mui/material';
import { BlockTitle, CaptionSmall } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import { Actions } from '@/core/ui/actions/Actions';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import RoleSetContributorsBlockWideContent from './RoleSetContributorsBlockWideContent';
import { RoleSetContributorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import AltToggle from '@/core/ui/forms/AltToggle/AltToggle';
import MultipleSelect from '@/core/ui/search/MultipleSelect';
import { useScreenSize } from '@/core/ui/grid/constants';
import { gutters } from '@/core/ui/grid/utils';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import Loading from '@/core/ui/loading/Loading';
import ImageBackdrop from '@/domain/shared/components/Backdrops/ImageBackdrop';
import Gutters from '@/core/ui/grid/Gutters';
import InviteContributorsWizard from '../../inviteContributors/InviteContributorsWizard';
import { Identifiable } from '@/core/utils/Identifiable';

const grayedOutUsersImgSrc = '/contributors/users-grayed.png';

type RoleSetContributorTypesBlockWideProps = {
  users: ContributorCardSquareProps[] | undefined;
  organizations: ContributorCardSquareProps[] | undefined;
  level?: SpaceLevel;
  hasInvitePrivilege: boolean;
  isDialogView?: boolean;
  isLoading?: boolean;
  showUsers: boolean;
};

const config = [
  {
    label: 'common.people',
    value: RoleSetContributorType.User,
  },
  {
    label: 'common.organizations',
    value: RoleSetContributorType.Organization,
  },
] as const;

const RoleSetContributorTypesBlockWide = ({
  users,
  showUsers,
  organizations,
  level = SpaceLevel.L0,
  hasInvitePrivilege,
  isDialogView = false,
  isLoading = false,
}: RoleSetContributorTypesBlockWideProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { t } = useTranslation();

  const [contributorType, setContributorType] = useState(RoleSetContributorType.User);
  const [filter, onFilterChange] = useState<string[]>([]);

  // People that can be invited to the community
  const filterInviteeContributors = useCallback(
    (contributor: Identifiable) => !(users ?? []).some(user => user.id === contributor.id),
    [users]
  );

  const contributorTypeToggleOptions = config.map(configItem => ({
    label: t(configItem.label),
    value: configItem.value,
  }));

  const { isSmallScreen } = useScreenSize();

  if (isLoading) {
    return <Loading text={t('common.loading')} />;
  }

  const contributorTypeToggle = () => (
    <AltToggle
      value={contributorType}
      options={contributorTypeToggleOptions}
      onChange={setContributorType}
      sx={{ height: gutters() }}
      aria-label={t('pages.generic.sections.community.switchMode')}
    />
  );

  if (isDialogView) {
    return (
      <>
        {hasInvitePrivilege && (
          <Box textAlign="right">
            <InviteContributorsWizard
              contributorType={RoleSetContributorType.User}
              filterContributors={filterInviteeContributors}
              onlyFromParentCommunity={level === SpaceLevel.L2}
            />
          </Box>
        )}
        <PageContentBlock>
          <PageContentBlockHeader
            title={''}
            actions={
              <MultipleSelect
                onChange={onFilterChange}
                value={filter}
                minLength={2}
                containerProps={{
                  marginLeft: theme => theme.spacing(2),
                }}
                size="xsmall"
                inlineTerms
              />
            }
          >
            {contributorTypeToggle()}
          </PageContentBlockHeader>
          <RoleSetContributorsBlockWideContent
            users={users}
            organizations={organizations}
            contributorType={contributorType}
            filter={filter}
            nested
            compactView
          />
        </PageContentBlock>
      </>
    );
  }

  return (
    <>
      <PageContentBlock>
        <PageContentBlockHeaderWithDialogAction
          showExpand={false}
          title={t('pages.generic.sections.community.contributors')}
          onDialogOpen={() => setIsDialogOpen(true)}
          actions={
            <MultipleSelect
              onChange={onFilterChange}
              value={filter}
              minLength={2}
              containerProps={{
                marginLeft: theme => theme.spacing(2),
              }}
              size="xsmall"
              inlineTerms
            />
          }
        >
          {contributorTypeToggle()}
        </PageContentBlockHeaderWithDialogAction>
        {showUsers ? (
          <RoleSetContributorsBlockWideContent
            users={users}
            organizations={organizations}
            contributorType={contributorType}
            filter={filter}
            nested
            compactView
          />
        ) : (
          <Gutters disablePadding>
            <ImageBackdrop
              src={grayedOutUsersImgSrc}
              backdropMessage="login"
              blockName="all-contributing-users"
              messageSx={theme => ({
                [theme.breakpoints.up('sm')]: {
                  fontWeight: 'bold',
                },
              })}
            />
          </Gutters>
        )}
        <Actions justifyContent="end">
          <ButtonBase component={CaptionSmall} onClick={() => setIsDialogOpen(true)}>
            {t('common.show-all')}
          </ButtonBase>
        </Actions>
      </PageContentBlock>
      <DialogWithGrid
        open={isDialogOpen}
        columns={12}
        onClose={() => setIsDialogOpen(false)}
        fullScreen={isSmallScreen}
        aria-labelledby="role-set-contributors-dialog"
      >
        <DialogHeader onClose={() => setIsDialogOpen(false)} id="role-set-contributors-dialog">
          <BlockTitle>{t('pages.generic.sections.community.contributors')}</BlockTitle>
        </DialogHeader>
        <RoleSetContributorsBlockWideContent
          users={users}
          organizations={organizations}
          contributorType={contributorType}
          filter={filter}
        />
      </DialogWithGrid>
    </>
  );
};

export default RoleSetContributorTypesBlockWide;
