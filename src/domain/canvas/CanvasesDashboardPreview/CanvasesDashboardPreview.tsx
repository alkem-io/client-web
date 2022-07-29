import DashboardGenericSection, {
  DashboardGenericSectionProps,
} from '../../shared/components/DashboardSections/DashboardGenericSection';
import { Typography } from '@mui/material';
import React from 'react';
import { CanvasDetailsFragment } from '../../../models/graphql-schema';
import { WbIncandescentOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import SimpleCard from '../../shared/components/SimpleCard';
import { LinkWithState } from '../../shared/types/LinkWithState';
import SimpleCardsList from '../../shared/components/SimpleCardsList';

interface CanvasesDashboardPreviewProps extends DashboardGenericSectionProps {
  canvases: CanvasDetailsFragment[];
  canvasesCount: number | undefined;
  loading?: boolean;
  noItemsMessage?: string;
  buildCanvasLink: (canvasNameId: string) => LinkWithState;
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

  return (
    <>
      <DashboardGenericSection
        headerText={headerText}
        {...sectionProps}
        navText={t('buttons.see-all')}
        navLink="canvases"
      >
        <SimpleCardsList>
          {canvases.map(canvas => (
            <SimpleCard
              key={canvas.id}
              {...buildCanvasLink(canvas.nameID)}
              title={canvas.displayName}
              imageUrl={canvas.preview?.uri}
              iconComponent={WbIncandescentOutlined}
            />
          ))}
        </SimpleCardsList>
        {canvases.length === 0 && noItemsMessage && !loading && <Typography>{noItemsMessage}</Typography>}
      </DashboardGenericSection>
    </>
  );
};

export default CanvasesDashboardPreview;
