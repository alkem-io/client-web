import DashboardGenericSection, {
  DashboardGenericSectionProps,
} from '../../../shared/components/DashboardSections/DashboardGenericSection';
import { Typography } from '@mui/material';
import React from 'react';
import { CanvasIcon } from '../icon/CanvasIcon';
import { useTranslation } from 'react-i18next';
import SimpleCard from '../../../shared/components/SimpleCard';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import SimpleCardsList from '../../../shared/components/SimpleCardsList';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { CanvasFragmentWithCallout } from '../../callout/useCallouts';

interface CanvasesDashboardPreviewProps extends DashboardGenericSectionProps {
  canvases: CanvasFragmentWithCallout[];
  canvasesCount: number | undefined;
  loading?: boolean;
  noItemsMessage?: string;
  buildCanvasLink: (canvasNameId: string, calloutNameId) => LinkWithState;
}

const CanvasesDashboardPreview = ({
  canvases,
  canvasesCount,
  loading,
  noItemsMessage,
  buildCanvasLink,
  ...sectionProps
}: CanvasesDashboardPreviewProps) => {
  const { t } = useTranslation();

  const headerText =
    typeof canvasesCount === 'undefined' ? t('common.canvases') : `${t('common.canvases')} (${canvasesCount})`;

  if (canvases.length === 0) {
    return null;
  }

  return (
    <DashboardGenericSection
      headerText={headerText}
      {...sectionProps}
      navText={t('buttons.see-all')}
      navLink={EntityPageSection.Explore}
    >
      <SimpleCardsList>
        {canvases.map(canvas => (
          <SimpleCard
            key={canvas.id}
            {...buildCanvasLink(canvas.nameID, canvas.calloutNameId)}
            title={canvas.displayName}
            imageUrl={canvas.preview?.uri}
            iconComponent={CanvasIcon}
          />
        ))}
      </SimpleCardsList>
      {canvases.length === 0 && noItemsMessage && !loading && <Typography>{noItemsMessage}</Typography>}
    </DashboardGenericSection>
  );
};

export default CanvasesDashboardPreview;
