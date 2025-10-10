import { PropsWithChildren } from 'react';

import { Link, Button } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import CheckIcon from '@mui/icons-material/Check';
import PublicIcon from '@mui/icons-material/Public';
import RemoveIcon from '@mui/icons-material/Remove';
import LaunchIcon from '@mui/icons-material/Launch';
import StorageIcon from '@mui/icons-material/Storage';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PinDropOutlinedIcon from '@mui/icons-material/PinDropOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SettingsAccessibilityOutlinedIcon from '@mui/icons-material/SettingsAccessibilityOutlined';
import useNavigate from '@/core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { BlockTitle } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import KnowledgeBaseDialog from '@/domain/community/virtualContributor/knowledgeBase/KnowledgeBaseDialog';
import Gutters from '@/core/ui/grid/Gutters';
import { useTemporaryHardCodedVCProfilePageData } from './useTemporaryHardCodedVCProfilePageData';
import { SettingsMotionModeIcon } from './SettingsMotionModeIcon';
import { VirtualContributorModelFull } from '../model/VirtualContributorModelFull';
import { EMPTY_MODEL_CARD } from '../model/VirtualContributorModelCardModel';

export type VCProfileContentViewProps = {
  virtualContributor?: VirtualContributorModelFull;
  openKnowledgeBaseDialog?: boolean;
};

const VCProfileContentView = ({ virtualContributor, openKnowledgeBaseDialog }: VCProfileContentViewProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const vcProfile = virtualContributor?.profile;
  const name = vcProfile?.displayName || t('pages.virtualContributorProfile.defaultName');

  const onCloseKnowledgeBase = () => {
    if (virtualContributor) {
      navigate(virtualContributor?.profile.url);
    }
  };

  const modelCard = virtualContributor?.modelCard ?? EMPTY_MODEL_CARD;
  const { sections } = useTemporaryHardCodedVCProfilePageData(modelCard);

  const renderCellIcon = (iconName: string) => {
    switch (iconName) {
      case 'functionalCapabilities':
        return <SettingsAccessibilityOutlinedIcon fontSize="large" />;

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
      <PageContentBlock>
        <Gutters disablePadding>
          <SectionTitle>{sections.functionality.title}</SectionTitle>

          <SectionWrapper>
            {sections.functionality.cells.map((cell, idx) =>
              cell ? (
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
              ) : null
            )}
          </SectionWrapper>
        </Gutters>
      </PageContentBlock>

      <PageContentBlock>
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

                <Gutters
                  disablePadding
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="center"
                  paddingTop={gutters(2)}
                >
                  {cell.answerIcon && renderCellIcon(cell.answerIcon)}

                  {cell.answer && <Caption>{cell.answer}</Caption>}

                  {cell.buttonText && (
                    <Link href={cell.to || '#'} underline="none" target="_blank">
                      <Button startIcon={<LaunchIcon />} variant="outlined" sx={{ paddingBlock: gutters(0.3) }}>
                        {cell.buttonText}
                      </Button>
                    </Link>
                  )}
                </Gutters>
              </SectionItem>
            ))}
          </SectionWrapper>
        </Gutters>
      </PageContentBlock>

      <PageContentBlock>
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

function SectionTitle({ children }) {
  return (
    <BlockTitle display={'flex'} alignItems={'center'} gap={gutters(0.5)}>
      {children}
    </BlockTitle>
  );
}

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
