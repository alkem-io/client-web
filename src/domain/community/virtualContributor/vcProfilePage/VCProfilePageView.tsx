import React, { FC, PropsWithChildren } from 'react';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ShieldIcon from '@mui/icons-material/Shield';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import BookIcon from '@mui/icons-material/Book';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import { VirtualContributorQuery } from '../../../../core/apollo/generated/graphql-schema';
import VCProfileView from '../views/VCProfileView';
import { BlockTitle, Text } from '../../../../core/ui/typography';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import HostCardClean from './HostCardClean';
import useTheme from '@mui/material/styles/useTheme';
import { Trans, useTranslation } from 'react-i18next';

interface Props {
  virtualContributor: VirtualContributorQuery['virtualContributor'] | undefined;
}

export const VCProfilePageView: FC<PropsWithChildren<Props>> = ({ virtualContributor }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const name = virtualContributor?.profile.displayName || t('pages.virtual-contributor-profile.default-name');

  return (
    <PageContent>
      <PageContentColumn columns={4}>
        <VCProfileView virtualContributor={virtualContributor} />
        <HostCardClean />
      </PageContentColumn>
      <PageContentColumn columns={8}>
        <PageContentBlock>
          <BlockTitle display={'flex'} alignItems={'center'}>
            <BookIcon htmlColor={theme.palette.icons.dark} sx={{ fontSize: '18px' }} />
            &nbsp;{t('pages.virtual-contributor-profile.sections.knowledge.title')}
          </BlockTitle>
          <Text>
            <Trans i18nKey="pages.virtual-contributor-profile.sections.knowledge.description" values={{ name }} />
          </Text>
          <BlockTitle display={'flex'} alignItems={'center'}>
            <RecordVoiceOverIcon htmlColor={theme.palette.icons.dark} sx={{ fontSize: '18px' }} />
            &nbsp;{t('pages.virtual-contributor-profile.sections.personality.title')}
          </BlockTitle>
          <Text>
            <Trans i18nKey="pages.virtual-contributor-profile.sections.personality.description" values={{ name }} />
          </Text>
          <BlockTitle display={'flex'} alignItems={'center'}>
            <CloudDownloadIcon htmlColor={theme.palette.icons.dark} sx={{ fontSize: '18px' }} />
            &nbsp;{t('pages.virtual-contributor-profile.sections.context.title')}
          </BlockTitle>
          <Text>
            <Trans i18nKey="pages.virtual-contributor-profile.sections.context.description" values={{ name }} />
            <Trans
              i18nKey="pages.virtual-contributor-profile.sections.context.bullets"
              components={{ ul: <ul />, li: <li /> }}
            />
          </Text>
        </PageContentBlock>
        <PageContentBlock>
          <BlockTitle display={'flex'} alignItems={'center'}>
            <ShieldIcon htmlColor={theme.palette.icons.dark} sx={{ fontSize: '18px' }} />
            &nbsp;{t('pages.virtual-contributor-profile.sections.privacy.title')}
          </BlockTitle>
          <Text>
            <Trans i18nKey="pages.virtual-contributor-profile.sections.privacy.description" values={{ name }} />
            <Trans
              i18nKey="pages.virtual-contributor-profile.sections.privacy.bullets"
              components={{ ul: <ul />, li: <li /> }}
            />
          </Text>
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};

export default VCProfilePageView;
