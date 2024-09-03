import React, { FC, PropsWithChildren } from 'react';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ShieldIcon from '@mui/icons-material/Shield';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import BookIcon from '@mui/icons-material/Book';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import { BlockTitle, Text } from '../../../../core/ui/typography';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import HostCard from '../components/HostCard';
import useTheme from '@mui/material/styles/useTheme';
import { Trans, useTranslation } from 'react-i18next';
import ProfileDetail from '../../profile/ProfileDetail/ProfileDetail';
import BasicSpaceCard, { BasicSpaceProps } from '../components/BasicSpaceCard';
import Spacer from '../../../../core/ui/content/Spacer';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';

interface VCProfilePageViewProps {
  virtualContributor?: {
    profile: {
      avatar?: {
        uri: string;
      };
      displayName: string;
      description?: string;
      location?: {
        city: string;
        country: string;
      };
    };
    provider: {
      profile: {
        displayName: string;
        description?: string;
      };
    };
  };
  bokProfile?: BasicSpaceProps;
  bokDescription?: string;
}

const SectionTitle = ({ children }) => (
  <BlockTitle display={'flex'} alignItems={'center'} gap={theme => theme.spacing(1)}>
    {children}
  </BlockTitle>
);

const SectionContent = ({ children }) => <Text>{children}</Text>;

export const VCProfilePageView: FC<PropsWithChildren<VCProfilePageViewProps>> = ({
  virtualContributor,
  bokProfile,
  bokDescription,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const name = virtualContributor?.profile.displayName || t('pages.virtualContributorProfile.default-name');

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
        <HostCard hostProfile={virtualContributor?.provider.profile} />
      </PageContentColumn>
      <PageContentColumn columns={8}>
        <PageContentBlock>
          <SectionTitle>
            <BookIcon htmlColor={theme.palette.icons.dark} sx={{ fontSize: '18px' }} />
            {t('pages.virtualContributorProfile.sections.knowledge.title')}
          </SectionTitle>
          <SectionContent>
            <Trans i18nKey="pages.virtualContributorProfile.sections.knowledge.description" values={{ name }} />
            {bokProfile ? (
              <BasicSpaceCard space={bokProfile} />
            ) : (
              <WrapperMarkdown>{bokDescription ?? ''}</WrapperMarkdown>
            )}
            <Spacer />
          </SectionContent>
          <SectionTitle>
            <RecordVoiceOverIcon htmlColor={theme.palette.icons.dark} sx={{ fontSize: '18px' }} />
            {t('pages.virtualContributorProfile.sections.personality.title')}
          </SectionTitle>
          <SectionContent>
            <Trans i18nKey="pages.virtualContributorProfile.sections.personality.description" values={{ name }} />
            <Spacer />
          </SectionContent>
          <SectionTitle>
            <CloudDownloadIcon htmlColor={theme.palette.icons.dark} sx={{ fontSize: '18px' }} />
            {t('pages.virtualContributorProfile.sections.context.title')}
          </SectionTitle>
          <SectionContent>
            <Trans i18nKey="pages.virtualContributorProfile.sections.context.description" values={{ name }} />
            <Trans
              i18nKey="pages.virtualContributorProfile.sections.context.bullets"
              components={{ ul: <ul />, li: <li /> }}
            />
          </SectionContent>
        </PageContentBlock>
        <PageContentBlock>
          <SectionTitle>
            <ShieldIcon htmlColor={theme.palette.icons.dark} sx={{ fontSize: '18px' }} />
            {t('pages.virtualContributorProfile.sections.privacy.title')}
          </SectionTitle>
          <SectionContent>
            <Trans i18nKey="pages.virtualContributorProfile.sections.privacy.description" values={{ name }} />
            <Trans
              i18nKey="pages.virtualContributorProfile.sections.privacy.bullets"
              components={{ ul: <ul />, li: <li /> }}
            />
          </SectionContent>
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};

export default VCProfilePageView;
