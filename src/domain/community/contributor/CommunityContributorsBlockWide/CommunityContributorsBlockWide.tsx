import { useState } from 'react';
import { ContributorCardSquareProps } from '../ContributorCardSquare/ContributorCardSquare';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeaderWithDialogAction from '@/core/ui/content/PageContentBlockHeaderWithDialogAction';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { ButtonBase, useMediaQuery } from '@mui/material';
import { BlockTitle, CaptionSmall } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import { Actions } from '@/core/ui/actions/Actions';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import CommunityContributorsBlockWideContent from './CommunityContributorsBlockWideContent';
import { CommunityContributorType } from '@/core/apollo/generated/graphql-schema';
import AltToggle from '@/core/ui/forms/AltToggle/AltToggle';
import MultipleSelect from '@/core/ui/search/MultipleSelect';
import { Theme } from '@mui/material/styles';
import { gutters } from '@/core/ui/grid/utils';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import Loading from '@/core/ui/loading/Loading';
import ImageBackdrop from '@/domain/shared/components/Backdrops/ImageBackdrop';
import Gutters from '@/core/ui/grid/Gutters';

const grayedOutUsersImgSrc = '/contributors/users-grayed.png';

type CommunityContributorsBlockWideProps = {
  users: ContributorCardSquareProps[] | undefined;
  organizations: ContributorCardSquareProps[] | undefined;
  isDialogView?: boolean;
  isLoading?: boolean;
  showUsers: boolean;
};

const config = [
  {
    label: 'common.people',
    value: CommunityContributorType.User,
  },
  {
    label: 'common.organizations',
    value: CommunityContributorType.Organization,
  },
] as const;

const CommunityContributorsBlockWide = ({
  users,
  showUsers,
  organizations,
  isDialogView = false,
  isLoading = false,
}: CommunityContributorsBlockWideProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { t } = useTranslation();

  const [contributorType, setContributorType] = useState(CommunityContributorType.User);
  const [filter, onFilterChange] = useState<string[]>([]);

  const contributorTypeToggleOptions = config.map(configItem => ({
    label: t(configItem.label),
    value: configItem.value,
  }));

  const isSmallScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

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
        <CommunityContributorsBlockWideContent
          users={users}
          organizations={organizations}
          contributorType={contributorType}
          filter={filter}
          nested
          compactView
        />
      </PageContentBlock>
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
          <CommunityContributorsBlockWideContent
            users={users}
            organizations={organizations}
            contributorType={contributorType}
            filter={filter}
            nested
            compactView
          />
        ) : (
          <Gutters>
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
      >
        <DialogHeader onClose={() => setIsDialogOpen(false)}>
          <BlockTitle>{t('pages.generic.sections.community.contributors')}</BlockTitle>
        </DialogHeader>
        <CommunityContributorsBlockWideContent
          users={users}
          organizations={organizations}
          contributorType={contributorType}
          filter={filter}
        />
      </DialogWithGrid>
    </>
  );
};

export default CommunityContributorsBlockWide;
