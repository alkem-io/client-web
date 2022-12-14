import DashboardGenericSection, {
  DashboardGenericSectionProps,
} from '../../../shared/components/DashboardSections/DashboardGenericSection';
import { Button, Typography } from '@mui/material';
import React from 'react';
import { Add } from '@mui/icons-material';
import { CanvasIcon } from '../icon/CanvasIcon';
import { useTranslation } from 'react-i18next';
import SimpleCard from '../../../shared/components/SimpleCard';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import SimpleCardsList from '../../../shared/components/SimpleCardsList';
import { CanvasFragmentWithCallout } from '../../callout/useCallouts';

interface CanvasesDashboardSectionProps extends DashboardGenericSectionProps {
  canvases: CanvasFragmentWithCallout[];
  loading?: boolean;
  noItemsMessage?: string;
  howToMessage?: string;
  onCreate?: () => void;
  canDelete?: boolean;
  canCreate?: boolean;
  buildCanvasUrl: (canvasNameId: string, calloutNameId: string) => LinkWithState;
}

const CanvasesDashboardSection = ({
  canvases,
  onCreate,
  canCreate,
  canDelete,
  loading,
  noItemsMessage,
  howToMessage,
  buildCanvasUrl,
  ...sectionProps
}: CanvasesDashboardSectionProps) => {
  const { t } = useTranslation();

  return (
    <>
      <DashboardGenericSection
        primaryAction={
          onCreate &&
          canCreate && (
            <Button onClick={onCreate} variant="contained" color="primary" startIcon={<Add />}>
              {t('pages.canvas.add-canvas')}
            </Button>
          )
        }
        {...sectionProps}
      >
        <SimpleCardsList>
          {canvases.map(canvas => (
            <SimpleCard
              key={canvas.id}
              {...buildCanvasUrl(canvas.nameID, canvas.calloutNameId)}
              title={canvas.displayName}
              imageUrl={canvas.preview?.uri}
              iconComponent={CanvasIcon}
            />
          ))}
        </SimpleCardsList>
        {canvases.length === 0 && noItemsMessage && !loading && <Typography>{noItemsMessage}</Typography>}
        {howToMessage && (
          <Typography color="neutralMedium.main" variant="caption">
            * {howToMessage}
          </Typography>
        )}
      </DashboardGenericSection>
    </>
  );
};

export default CanvasesDashboardSection;
