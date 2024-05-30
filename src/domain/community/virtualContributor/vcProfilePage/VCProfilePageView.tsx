import React, { FC, PropsWithChildren } from 'react';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ShieldIcon from '@mui/icons-material/Shield';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import BookIcon from '@mui/icons-material/Book';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import { VirtualContributorQuery } from '../../../../core/apollo/generated/graphql-schema';
import { BlockTitle, Text } from '../../../../core/ui/typography';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import HostCardClean from './HostCardClean';
import useTheme from '@mui/material/styles/useTheme';
import { Trans, useTranslation } from 'react-i18next';
import ProfileDetail from '../../profile/ProfileDetail/ProfileDetail';
import SpaceHorizontalCard, { BokProps } from './SpaceHorizontalCard';

interface Props extends BokProps {
  virtualContributor: VirtualContributorQuery['virtualContributor'] | undefined;
  showDefaults?: boolean;
}

export const VCProfilePageView: FC<PropsWithChildren<Props>> = ({
  virtualContributor,
  bokProfile,
  showDefaults = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const name = virtualContributor?.profile.displayName || t('pages.virtual-contributor-profile.default-name');

  const SectionTitle = ({ children }) => (
    <BlockTitle display={'flex'} alignItems={'center'} gap={theme.spacing(1)}>
      {children}
    </BlockTitle>
  );
  const SectionContent = ({ children, withBottomOffset = false }) => (
    <Text marginBottom={withBottomOffset ? theme.spacing(2) : 0}>{children}</Text>
  );

  return (
    <PageContent>
      <PageContentColumn columns={4}>
        <PageContentBlock disableGap>
          <ProfileDetail
            title={t('components.profile.fields.description.title')}
            value={virtualContributor?.profile.description}
            aria-label="description"
          />
        </PageContentBlock>
        <HostCardClean hostProfile={virtualContributor?.account.host?.profile} />
      </PageContentColumn>
      <PageContentColumn columns={8}>
        <PageContentBlock>
          <SectionTitle>
            <BookIcon htmlColor={theme.palette.icons.dark} sx={{ fontSize: '18px' }} />
            {t('pages.virtual-contributor-profile.sections.knowledge.title')}
          </SectionTitle>
          <SectionContent withBottomOffset>
            <Trans i18nKey="pages.virtual-contributor-profile.sections.knowledge.description" values={{ name }} />
            <SpaceHorizontalCard bokProfile={bokProfile} showDefaults={showDefaults} />
          </SectionContent>
          <SectionTitle>
            <RecordVoiceOverIcon htmlColor={theme.palette.icons.dark} sx={{ fontSize: '18px' }} />
            {t('pages.virtual-contributor-profile.sections.personality.title')}
          </SectionTitle>
          <SectionContent withBottomOffset>
            <Trans i18nKey="pages.virtual-contributor-profile.sections.personality.description" values={{ name }} />
          </SectionContent>
          <SectionTitle>
            <CloudDownloadIcon htmlColor={theme.palette.icons.dark} sx={{ fontSize: '18px' }} />
            {t('pages.virtual-contributor-profile.sections.context.title')}
          </SectionTitle>
          <SectionContent>
            <Trans i18nKey="pages.virtual-contributor-profile.sections.context.description" values={{ name }} />
            <Trans
              i18nKey="pages.virtual-contributor-profile.sections.context.bullets"
              components={{ ul: <ul />, li: <li /> }}
            />
          </SectionContent>
        </PageContentBlock>
        <PageContentBlock>
          <SectionTitle>
            <ShieldIcon htmlColor={theme.palette.icons.dark} sx={{ fontSize: '18px' }} />
            {t('pages.virtual-contributor-profile.sections.privacy.title')}
          </SectionTitle>
          <SectionContent>
            <Trans i18nKey="pages.virtual-contributor-profile.sections.privacy.description" values={{ name }} />
            <Trans
              i18nKey="pages.virtual-contributor-profile.sections.privacy.bullets"
              components={{ ul: <ul />, li: <li /> }}
            />
          </SectionContent>
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};

export default VCProfilePageView;
