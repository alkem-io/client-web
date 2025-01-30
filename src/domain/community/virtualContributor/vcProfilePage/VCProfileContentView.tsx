import useNavigate from '@/core/routing/useNavigate';
import { Button } from '@mui/material';
import BookIcon from '@mui/icons-material/Book';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ShieldIcon from '@mui/icons-material/Shield';
import useTheme from '@mui/material/styles/useTheme';
import { Trans, useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import Spacer from '@/core/ui/content/Spacer';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { BlockTitle, Text } from '@/core/ui/typography';
import BasicSpaceCard from '../components/BasicSpaceCard';
import { gutters } from '@/core/ui/grid/utils';
import { type VCProfilePageViewProps } from './model';
import { AiPersonaBodyOfKnowledgeType } from '@/core/apollo/generated/graphql-schema';
import KnowledgeBaseDialog from '@/domain/community/virtualContributor/knowledgeBase/KnowledgeBaseDialog';
import { KNOWLEDGE_BASE_PATH } from '@/main/routing/urlBuilders';

const SectionTitle = ({ children }) => {
  return (
    <BlockTitle display={'flex'} alignItems={'center'} gap={gutters(0.5)}>
      {children}
    </BlockTitle>
  );
};

const SectionContent = ({ children }) => {
  return <Text>{children}</Text>;
};

export const VCProfileContentView = ({
  bokProfile,
  virtualContributor,
  openKnowledgeBaseDialog,
}: VCProfilePageViewProps) => {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const darkIcons = palette.icons.dark;

  const vcTBase = 'pages.virtualContributorProfile.sections';
  const { t: vcT } = useTranslation('translation', { keyPrefix: vcTBase });
  const externalVcTBase = 'pages.virtualContributorProfile.sections.external';
  const { t: externalVcT } = useTranslation('translation', { keyPrefix: externalVcTBase });

  const vcProfile = virtualContributor?.profile;
  const name = vcProfile?.displayName || t('pages.virtualContributorProfile.defaultName');

  const bokDescription = virtualContributor?.aiPersona?.bodyOfKnowledge;
  const vcType = virtualContributor?.aiPersona?.bodyOfKnowledgeType;
  const isExternal = vcType === AiPersonaBodyOfKnowledgeType.None;
  const hasSpaceKnowledge = vcType === AiPersonaBodyOfKnowledgeType.AlkemioSpace;

  const handleKnowledgeBaseClick = () => {
    if (virtualContributor) {
      navigate(`${virtualContributor.profile.url}/${KNOWLEDGE_BASE_PATH}`);
    }
  };

  const onCloseKnowledgeBase = () => {
    if (virtualContributor) {
      navigate(virtualContributor.profile.url);
    }
  };

  return (
    <>
      <PageContentBlock>
        {!isExternal && (
          <>
            <SectionTitle>
              <BookIcon htmlColor={darkIcons} sx={{ fontSize: '18px' }} />
              {vcT('knowledge.title')}
            </SectionTitle>

            <SectionContent>
              {vcT('knowledge.description', { name })}

              {hasSpaceKnowledge ? (
                <BasicSpaceCard space={bokProfile} />
              ) : (
                <>
                  <WrapperMarkdown>{bokDescription ?? ''}</WrapperMarkdown>
                  <Button variant="outlined" color="primary" onClick={handleKnowledgeBaseClick}>
                    {t('buttons.visit')}
                  </Button>
                </>
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
          {isExternal ? (
            <Trans i18nKey={`${externalVcTBase}.personality.description`} components={{ strong: <strong /> }} />
          ) : (
            vcT('personality.description', { name })
          )}

          <Spacer />
        </SectionContent>

        {!isExternal && (
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
          {isExternal ? externalVcT('privacy.description') : vcT('privacy.description', { name })}

          <Trans
            i18nKey={isExternal ? `${externalVcTBase}.privacy.bullets` : `${vcTBase}.privacy.bullets`}
            components={{ ul: <ul />, li: <li /> }}
          />
        </SectionContent>
      </PageContentBlock>
      {openKnowledgeBaseDialog && (
        <KnowledgeBaseDialog
          id={virtualContributor?.id ?? ''}
          title={`${name}: ${t('virtualContributorSpaceSettings.bodyOfKnowledge')}`}
          onClose={onCloseKnowledgeBase}
        />
      )}
    </>
  );
};

export default VCProfileContentView;
