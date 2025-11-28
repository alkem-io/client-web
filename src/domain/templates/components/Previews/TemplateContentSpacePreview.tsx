import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import Loading from '@/core/ui/loading/Loading';
import InnovationFlowChips from '@/domain/collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowChips';
import InnovationFlowCalloutsPreview from '../../../collaboration/InnovationFlow/InnovationFlowCalloutsPreview';
import { TemplateContentSpaceModel } from '../../contentSpace/model/TemplateContentSpaceModel';
import { Caption } from '@/core/ui/typography';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import SpaceCard from '@/domain/space/components/cards/SpaceCard';
import { useColumns } from '@/core/ui/grid/GridContext';
import { useScreenSize } from '@/core/ui/grid/constants';
import Gutters from '@/core/ui/grid/Gutters';
import { useTranslation } from 'react-i18next';

interface TemplateContentSpacePreviewProps {
  loading?: boolean;
  template?: {
    contentSpace?: TemplateContentSpaceModel;
  };
}

const TemplateContentSpacePreview = ({ template, loading }: TemplateContentSpacePreviewProps) => {
  const { t } = useTranslation();
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  const collaboration = template?.contentSpace?.collaboration;
  const templateStates = collaboration?.innovationFlow?.states ?? [];
  const callouts = collaboration?.calloutsSet?.callouts ?? [];

  const columns = useColumns();
  const { isSmallScreen } = useScreenSize();
  const cardColumns = useMemo(() => (isSmallScreen ? columns / 2 : columns / 4), [isSmallScreen, columns]);

  useEffect(() => {
    if (
      templateStates &&
      templateStates.length > 0 &&
      selectedState &&
      !templateStates.map(state => state.displayName).includes(selectedState)
    ) {
      setSelectedState(templateStates[0]?.displayName);
    }
  }, [selectedState, templateStates]);

  useEffect(() => {
    if (!selectedState && templateStates.length > 0) {
      setSelectedState(templateStates[0]?.displayName);
    }
  }, [selectedState, templateStates]);

  const subspaces = useMemo(() => {
    if (template?.contentSpace?.subspaces && template.contentSpace.subspaces.length > 0) {
      return (
        <>
          <Caption>{t('templateLibrary.spaceTemplates.includesSubspaces')}</Caption>
          <Gutters row disablePadding flexWrap="wrap">
            {template.contentSpace.subspaces.map((subspace, index) => (
              <SpaceCard
                key={index}
                columns={cardColumns}
                spaceId={subspace.id}
                displayName={subspace.about.profile.displayName}
                banner={subspace.about.profile.cardBanner}
                isPrivate={!subspace.about.isContentPublic}
                level={SpaceLevel.L1}
                compact
              />
            ))}
          </Gutters>
        </>
      );
    }
    return null;
  }, [template?.contentSpace?.subspaces, t, cardColumns]);

  return (
    <>
      <PageContentBlock>
        {loading && (
          <Box textAlign="center">
            <Loading />
          </Box>
        )}
        {!loading && (
          <InnovationFlowChips
            states={templateStates}
            selectedState={selectedState}
            onSelectState={state => setSelectedState(state.displayName)}
          />
        )}
        <InnovationFlowCalloutsPreview callouts={callouts} selectedState={selectedState} loading={loading} />
        {subspaces}
      </PageContentBlock>
    </>
  );
};

export default TemplateContentSpacePreview;
