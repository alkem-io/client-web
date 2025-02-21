import { PropsWithChildren } from 'react';

import { Caption } from '@/core/ui/typography';
import CheckIcon from '@mui/icons-material/Check';
import PublicIcon from '@mui/icons-material/Public';
import RemoveIcon from '@mui/icons-material/Remove';
import StorageIcon from '@mui/icons-material/Storage';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PinDropOutlinedIcon from '@mui/icons-material/PinDropOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SettingsAccessibilityOutlinedIcon from '@mui/icons-material/SettingsAccessibilityOutlined';
import useNavigate from '@/core/routing/useNavigate';
// import { Button } from '@mui/material';
// import BookIcon from '@mui/icons-material/Book';
// import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
// import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
// import ShieldIcon from '@mui/icons-material/Shield';
// import useTheme from '@mui/material/styles/useTheme';
import {
  // Trans,
  useTranslation,
} from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
// import Spacer from '@/core/ui/content/Spacer';
// import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import {
  BlockTitle,
  // Text
} from '@/core/ui/typography';
// import BasicSpaceCard from '../components/BasicSpaceCard';
import { gutters } from '@/core/ui/grid/utils';
import { type VCProfilePageViewProps } from './model';
// import { AiPersonaBodyOfKnowledgeType } from '@/core/apollo/generated/graphql-schema';
import KnowledgeBaseDialog from '@/domain/community/virtualContributor/knowledgeBase/KnowledgeBaseDialog';
// import { KNOWLEDGE_BASE_PATH } from '@/main/routing/urlBuilders';
import Gutters from '@/core/ui/grid/Gutters';
import { useTemporaryHardCodedVCProfilePageData } from './useTemporaryHardCodedVCProfilePageData';

import { SettingsMotionModeIcon } from './SettingsMotionModeIcon';

const SectionTitle = ({ children }) => {
  return (
    <BlockTitle display={'flex'} alignItems={'center'} gap={gutters(0.5)}>
      {children}
    </BlockTitle>
  );
};

// const SectionContent = ({ children }) => {
//   return <Text>{children}</Text>;
// };

export const VCProfileContentView = ({
  // bokProfile,
  virtualContributor,
  openKnowledgeBaseDialog,
}: VCProfilePageViewProps) => {
  // const { palette } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // const darkIcons = palette.icons.dark;

  // const vcTBase = 'pages.virtualContributorProfile.sections';
  // const { t: vcT } = useTranslation('translation', { keyPrefix: vcTBase });
  // const externalVcTBase = 'pages.virtualContributorProfile.sections.external';
  // const { t: externalVcT } = useTranslation('translation', { keyPrefix: externalVcTBase });

  const vcProfile = virtualContributor?.profile;
  const name = vcProfile?.displayName || t('pages.virtualContributorProfile.defaultName');

  // const bokDescription = virtualContributor?.aiPersona?.bodyOfKnowledge;
  // const vcType = virtualContributor?.aiPersona?.bodyOfKnowledgeType;
  // const isExternal = vcType === AiPersonaBodyOfKnowledgeType.None;
  // const hasSpaceKnowledge = vcType === AiPersonaBodyOfKnowledgeType.AlkemioSpace;

  // const handleKnowledgeBaseClick = () => {
  //   if (virtualContributor) {
  //     navigate(`${virtualContributor.profile.url}/${KNOWLEDGE_BASE_PATH}`);
  //   }
  // };

  const onCloseKnowledgeBase = () => {
    if (virtualContributor) {
      navigate(virtualContributor.profile.url);
    }
  };
  // --------------------------------------------------------------------------------------------

  const { sections } = useTemporaryHardCodedVCProfilePageData();
  console.log('sections', sections);

  const renderCellIcon = (iconName: string) => {
    switch (iconName) {
      case 'functionalCapabilities': {
        return <SettingsAccessibilityOutlinedIcon fontSize="large" />;
      }

      case 'cloudUpload':
        return <CloudUploadOutlinedIcon fontSize="large" />;

      case 'shieldPerson':
        return <AdminPanelSettingsOutlinedIcon fontSize="large" />;

      case 'settingsMotion':
        return <SettingsMotionModeIcon />;

      case 'database':
        return <StorageIcon fontSize="large" />;

      case 'knowledge':
        return <SchoolOutlinedIcon fontSize="large" />;

      case 'globe':
        return <PublicIcon fontSize="large" />;

      case 'location':
        return <PinDropOutlinedIcon fontSize="large" />;

      case 'techReferences':
        return <AdminPanelSettingsOutlinedIcon fontSize="large" />;

      case 'check':
        return <TaskAltOutlinedIcon />;

      case 'exclamation':
        return <ErrorOutlineIcon />;

      default: {
        return null;
      }
    }
  };

  return (
    <>
      {/*
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
      */}

      {/* TO BE UPDATED --START-- */}
      {/* <PageContentBlock>
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
      </PageContentBlock> */}
      {/* TO BE UPDATED --END-- */}

      <PageContentBlock data-attr="TEST-SECTION-WRAPPER">
        <Gutters disablePadding>
          <SectionTitle>{sections.functionality.title}</SectionTitle>

          <SectionWrapper>
            {sections.functionality.cells.map((cell, idx) => (
              <SectionItem key={idx}>
                <Gutters disablePadding alignItems="center" paddingBottom={gutters(1)}>
                  {renderCellIcon(cell.icon)}
                </Gutters>

                <Caption fontWeight={700} textAlign="center" sx={{ marginBottom: gutters(1) }}>
                  {cell.title}
                </Caption>

                {cell?.bullets?.map((bullet, idx) => (
                  <Gutters key={idx} disablePadding paddingLeft={gutters(1.2)}>
                    <Gutters
                      disablePadding
                      position="relative"
                      flexDirection="row"
                      alignItems="start"
                      marginTop={gutters(0.5)}
                    >
                      {bullet.icon ? (
                        <CheckIcon fontSize="small" sx={{ position: 'absolute', left: -24 }} />
                      ) : (
                        <RemoveIcon fontSize="small" sx={{ position: 'absolute', left: -24 }} />
                      )}

                      <Caption>{bullet.text}</Caption>
                    </Gutters>
                  </Gutters>
                ))}

                {cell.description && (
                  <Gutters disableGap disablePadding>
                    <Caption sx={{ textAlign: 'center' }}>
                      {/* dangerouslySetInnerHTML is used temporarily because we're using hard-coded values. REMOVE when data is fetched from server and use Trans! */}
                      <span dangerouslySetInnerHTML={{ __html: cell.description }} />
                    </Caption>
                  </Gutters>
                )}
              </SectionItem>
            ))}
          </SectionWrapper>
        </Gutters>
      </PageContentBlock>

      <PageContentBlock data-attr="TEST-SECTION-WRAPPER">
        <Gutters disablePadding>
          <SectionTitle>{sections.aiEngine.title}</SectionTitle>

          <SectionWrapper>
            {sections.aiEngine.cells.map((cell, idx) => (
              <SectionItem key={idx}>
                <Gutters disablePadding alignItems="center" paddingBottom={gutters(1)}>
                  {renderCellIcon(cell.icon)}
                </Gutters>

                <Caption fontWeight={700} textAlign="center" sx={{ marginBottom: gutters(1) }}>
                  {cell.title}
                </Caption>

                {cell.description && (
                  <Gutters disableGap disablePadding>
                    <Caption sx={{ textAlign: 'center' }}>{cell.description}</Caption>
                  </Gutters>
                )}
              </SectionItem>
            ))}
          </SectionWrapper>
        </Gutters>
      </PageContentBlock>

      <PageContentBlock data-attr="TEST-SECTION-WRAPPER">
        <SectionTitle>{sections.monitoring.title}</SectionTitle>

        <Gutters disableGap disablePadding>
          <Caption>
            {/* dangerouslySetInnerHTML is used temporarily because we're using hard-coded values. REMOVE when data is fetched from server and use Trans! */}
            <span dangerouslySetInnerHTML={{ __html: sections.monitoring.description }} />
          </Caption>
        </Gutters>
      </PageContentBlock>

      {openKnowledgeBaseDialog && (
        <KnowledgeBaseDialog
          id={virtualContributor?.id ?? ''}
          title={`${name}: ${t('virtualContributorSpaceSettings.bodyOfKnowledge')}`}
          placeholder={t('virtualContributorSpaceSettings.placeholder')}
          onClose={onCloseKnowledgeBase}
        />
      )}
    </>
  );
};

export default VCProfileContentView;

function SectionWrapper({ children }: PropsWithChildren<{}>) {
  return (
    <Gutters disablePadding sx={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {children}
    </Gutters>
  );
}

function SectionItem({ children }: PropsWithChildren<{}>) {
  return (
    <Gutters
      disableGap
      sx={theme => ({
        flex: '1 1 270px',
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
      })}
    >
      {children}
    </Gutters>
  );
}
