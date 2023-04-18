import React, { useState } from 'react';
import { ContributorCardProps } from '../ContributorCardSquare/ContributorCardSquare';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeaderWithDialogAction from '../../../../core/ui/content/PageContentBlockHeaderWithDialogAction';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { ButtonBase } from '@mui/material';
import { BlockTitle, CaptionSmall } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import { Actions } from '../../../../core/ui/actions/Actions';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import CommunityContributorsBlockWideContent, { ContributorType } from './CommunityContributorsBlockWideContent';
import AltToggle from '../../../../core/ui/forms/AltToggle/AltToggle';

interface CommunityContributorsBlockWideProps {
  users: ContributorCardProps[] | undefined;
  organizations: ContributorCardProps[] | undefined;
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

const CommunityContributorsBlockWide = ({ users, organizations }: CommunityContributorsBlockWideProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { t } = useTranslation();

  const [contributorType, setContributorType] = useState(ContributorType.People);

  const contributorTypeToggleOptions = config.map(configItem => ({
    label: t(configItem.label),
    value: configItem.value,
  }));

  return (
    <>
      <PageContentBlock>
        <PageContentBlockHeaderWithDialogAction
          title={t('pages.generic.sections.community.contributors')}
          onDialogOpen={() => setIsDialogOpen(true)}
          actions={
            <>
              <AltToggle value={contributorType} options={contributorTypeToggleOptions} onChange={setContributorType} />
            </>
          }
        />
        <CommunityContributorsBlockWideContent
          users={users}
          organizations={organizations}
          contributorType={contributorType}
          nested
        />
        <Actions justifyContent="end">
          <ButtonBase component={CaptionSmall} onClick={() => setIsDialogOpen(true)}>
            {t('common.show-all')}
          </ButtonBase>
        </Actions>
      </PageContentBlock>
      <DialogWithGrid open={isDialogOpen} columns={12} onClose={() => setIsDialogOpen(false)}>
        <DialogHeader onClose={() => setIsDialogOpen(false)}>
          <BlockTitle>{t('pages.generic.sections.community.contributors')}</BlockTitle>
        </DialogHeader>
        <CommunityContributorsBlockWideContent
          users={users}
          organizations={organizations}
          contributorType={contributorType}
        />
      </DialogWithGrid>
    </>
  );
};

export default CommunityContributorsBlockWide;
