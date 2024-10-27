import BookIcon from '@mui/icons-material/Book';
import ShieldIcon from '@mui/icons-material/Shield';
import useTheme from '@mui/material/styles/useTheme';
import { Trans, useTranslation } from 'react-i18next';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

import HostCard from '../components/HostCard';
import Spacer from '../../../../core/ui/content/Spacer';
import BasicSpaceCard from '../components/BasicSpaceCard';
import PageContent from '../../../../core/ui/content/PageContent';
import { Text, BlockTitle } from '../../../../core/ui/typography';
import ProfileDetail from '../../profile/ProfileDetail/ProfileDetail';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';

import { type VCProfilePageViewProps } from './model';
import { gutters } from '../../../../core/ui/grid/utils';

export const VCProfilePageView = ({
  hasBokId,
  bokProfile,
  bokDescription,
  virtualContributor,
}: VCProfilePageViewProps) => {
  const { palette } = useTheme();

  const { t } = useTranslation();
  const vcTBase = 'pages.virtualContributorProfile.sections';
  const { t: vcT } = useTranslation('translation', { keyPrefix: vcTBase });
  const externalVcTBase = 'pages.virtualContributorProfile.sections.external';
  const { t: externalVcT } = useTranslation('translation', { keyPrefix: externalVcTBase });

  const darkIcons = palette.icons.dark;
  const hasBokProfile = Boolean(bokProfile);
  const vcProfile = virtualContributor?.profile;
  const name = vcProfile?.displayName || t('pages.virtualContributorProfile.defaultName');

  return (
    <PageContent>
      <PageContentColumn columns={4}>
        <PageContentBlock disableGap>
          <ProfileDetail
            title={t('components.profile.fields.description.title')}
            value={vcProfile?.description}
            aria-label="description"
          />
        </PageContentBlock>

        <HostCard hostProfile={virtualContributor?.provider.profile} />
      </PageContentColumn>

      <PageContentColumn columns={8}>
        <PageContentBlock>
          {hasBokId && (
            <>
              <SectionTitle>
                <BookIcon htmlColor={darkIcons} sx={{ fontSize: '18px' }} />
                {vcT('knowledge.title')}
              </SectionTitle>

              <SectionContent>
                {vcT('knowledge.description', { name })}

                {hasBokProfile ? (
                  <BasicSpaceCard space={bokProfile} />
                ) : (
                  <WrapperMarkdown>{bokDescription ?? ''}</WrapperMarkdown>
                )}

                <Spacer />
              </SectionContent>
            </>
          )}

          <SectionTitle>
            <RecordVoiceOverIcon htmlColor={darkIcons} sx={{ fontSize: '18px' }} />

            {vcT('personality.title')}
          </SectionTitle>

          <SectionContent>
            {hasBokId ? (
              vcT('personality.description', { name })
            ) : (
              <Trans i18nKey={`${externalVcTBase}.personality.description`} components={{ strong: <strong /> }} />
            )}

            <Spacer />
          </SectionContent>

          {hasBokId && (
            <>
              <SectionTitle>
                <CloudDownloadIcon htmlColor={darkIcons} sx={{ fontSize: '18px' }} />
                {vcT('context.title')}
              </SectionTitle>

              <SectionContent>
                {vcT('context.description', { name })}

                <Trans i18nKey={`${vcTBase}.context.bullets`} components={{ ul: <ul />, li: <li /> }} />
              </SectionContent>
            </>
          )}
        </PageContentBlock>

        <PageContentBlock>
          <SectionTitle>
            <ShieldIcon htmlColor={darkIcons} sx={{ fontSize: '18px' }} />

            {vcT('privacy.title')}
          </SectionTitle>

          <SectionContent>
            {hasBokId ? vcT('privacy.description', { name }) : externalVcT('privacy.description')}

            <Trans
              i18nKey={hasBokId ? `${vcTBase}.privacy.bullets` : `${externalVcTBase}.privacy.bullets`}
              components={{ ul: <ul />, li: <li /> }}
            />
          </SectionContent>
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};

export default VCProfilePageView;

function SectionTitle({ children }) {
  return (
    <BlockTitle display={'flex'} alignItems={'center'} gap={gutters(0.5)}>
      {children}
    </BlockTitle>
  );
}

function SectionContent({ children }) {
  return <Text>{children}</Text>;
}
