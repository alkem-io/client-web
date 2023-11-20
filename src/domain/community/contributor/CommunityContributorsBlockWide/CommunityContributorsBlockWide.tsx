import React, { useState } from 'react';
import { ContributorCardSquareProps } from '../ContributorCardSquare/ContributorCardSquare';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeaderWithDialogAction from '../../../../core/ui/content/PageContentBlockHeaderWithDialogAction';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { ButtonBase, useMediaQuery } from '@mui/material';
import { BlockTitle, CaptionSmall } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import { Actions } from '../../../../core/ui/actions/Actions';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import CommunityContributorsBlockWideContent, { ContributorType } from './CommunityContributorsBlockWideContent';
import AltToggle from '../../../../core/ui/forms/AltToggle/AltToggle';
import MultipleSelect from '../../../../core/ui/search/MultipleSelect';
import { Theme } from '@mui/material/styles';
import { gutters } from '../../../../core/ui/grid/utils';

interface CommunityContributorsBlockWideProps {
  users: ContributorCardSquareProps[] | undefined;
  organizations: ContributorCardSquareProps[] | undefined;
}

const config = [
  {
    label: 'common.people',
    value: ContributorType.People,
  },
  {
    label: 'common.organizations',
    value: ContributorType.Organizations,
  },
] as const;

const COMPACT_VIEW_ITEMS_LIMIT = 3 * 8; // 3 rows on Desktop

const CommunityContributorsBlockWide = ({ users, organizations }: CommunityContributorsBlockWideProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { t } = useTranslation();

  const [contributorType, setContributorType] = useState(ContributorType.People);
  const [filter, onFilterChange] = useState<string[]>([]);

  const contributorTypeToggleOptions = config.map(configItem => ({
    label: t(configItem.label),
    value: configItem.value,
  }));

  const isSmallScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  return (
    <>
      <PageContentBlock>
        <PageContentBlockHeaderWithDialogAction
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
            />
          }
        >
          <AltToggle
            value={contributorType}
            options={contributorTypeToggleOptions}
            onChange={setContributorType}
            sx={{ height: gutters() }}
            aria-label={t('pages.generic.sections.community.switchMode')}
          />
        </PageContentBlockHeaderWithDialogAction>
        <CommunityContributorsBlockWideContent
          users={users?.slice(0, COMPACT_VIEW_ITEMS_LIMIT)}
          organizations={organizations?.slice(0, COMPACT_VIEW_ITEMS_LIMIT)}
          contributorType={contributorType}
          filter={filter}
          nested
        />
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
