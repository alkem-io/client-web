import DashboardGenericSection, {
  DashboardGenericSectionProps,
} from '../../shared/components/DashboardSections/DashboardGenericSection';
import { Button, Typography } from '@mui/material';
import React from 'react';
import { CanvasDetailsFragment } from '../../../models/graphql-schema';
import { CanvasListItemCanvas } from '../../../components/composite/lists/Canvas/CanvasListItem';
import { Add, WbIncandescentOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import SimpleCard from '../../shared/components/SimpleCard';
import { LinkWithState } from '../../shared/types/LinkWithState';
import SimpleCardsList from '../../shared/components/SimpleCardsList';

interface CanvasCardsViewProps extends DashboardGenericSectionProps {
  canvases: CanvasDetailsFragment[];
  loading?: boolean;
  noItemsMessage?: string;
  howToMessage?: string;
  onCreate?: () => void;
  onDelete: (canvas: CanvasListItemCanvas) => void;
  canDelete?: boolean;
  canCreate?: boolean;
  buildCanvasUrl: (canvas: CanvasDetailsFragment) => LinkWithState;
}

const CanvasCardsView = ({
  canvases,
  onCreate,
  onDelete,
  canCreate,
  canDelete,
  loading,
  noItemsMessage,
  howToMessage,
  buildCanvasUrl,
  ...sectionProps
}: CanvasCardsViewProps) => {
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
              {...buildCanvasUrl(canvas)}
              title={canvas.displayName}
              imageUrl={canvas.bannerCard?.uri}
              iconComponent={WbIncandescentOutlined}
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

export default CanvasCardsView;
