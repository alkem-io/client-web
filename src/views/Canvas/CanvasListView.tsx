import { Add } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardGenericSection from '../../domain/shared/components/DashboardSections/DashboardGenericSection';
import CanvasList from '../../components/composite/lists/Canvas/CanvasList';
import { ViewProps } from '../../models/view';
import { CanvasDetailsFragment } from '../../models/graphql-schema';

interface CanvasListViewEntities {
  canvases: CanvasDetailsFragment[];
  header: string;
  subheader?: string;
  noItemsMessage?: string;
  howToMessage?: string;
}
interface CanvasListViewState {
  loading: boolean;
}
interface CanvasListViewActions {
  onSelect: (canvas: CanvasDetailsFragment) => void;
  onCreate?: () => void;
  onDelete: (canvas: CanvasDetailsFragment) => void;
}

interface CanvasListViewOptions {
  canDelete?: boolean;
  canCreate?: boolean;
}

interface CanvasListViewProps
  extends ViewProps<CanvasListViewEntities, CanvasListViewActions, CanvasListViewState, CanvasListViewOptions> {}

export const CanvasListView: FC<CanvasListViewProps> = ({ entities, state, actions, options }) => {
  const { t } = useTranslation();
  const { noItemsMessage, howToMessage, header, subheader } = entities;

  return (
    <DashboardGenericSection
      headerText={header}
      subHeaderText={subheader}
      headerSpacing="none"
      primaryAction={
        actions.onCreate &&
        options.canCreate && (
          <Button onClick={actions.onCreate} variant="contained" color="primary" startIcon={<Add />}>
            {t('pages.canvas.add-canvas')}
          </Button>
        )
      }
    >
      <CanvasList entities={entities} actions={actions} state={state} options={options} disablePadding />
      {entities.canvases.length === 0 && noItemsMessage && !state.loading && <Typography>{noItemsMessage}</Typography>}
      {howToMessage && (
        <Typography color="neutralMedium.main" variant="caption">
          * {howToMessage}
        </Typography>
      )}
    </DashboardGenericSection>
  );
};
