import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import CanvasList from '../../components/composite/lists/Canvas/CanvasList';
import { CanvasWithoutValue } from '../../models/entities/canvas';
import { ViewProps } from '../../models/view';

interface CanvasListViewEntities {
  canvases: CanvasWithoutValue[];
  headerTemplate: string;
  subheaderTemplate?: string;
}
interface CanvasListViewState {
  loading: boolean;
}
interface CanvasListViewActions {
  onSelect: (canvas: CanvasWithoutValue) => void;
  onCreate?: () => void;
  onDelete: (canvas: CanvasWithoutValue) => void;
}

interface CanvasListViewOptions {
  canDelete?: boolean;
}

interface CanvasListViewProps
  extends ViewProps<CanvasListViewEntities, CanvasListViewActions, CanvasListViewState, CanvasListViewOptions> {}

export const CanvasListView: FC<CanvasListViewProps> = ({ entities, state, actions, options }) => {
  const { t } = useTranslation();

  return (
    <DashboardGenericSection
      headerText={entities.headerTemplate}
      subHeaderText={entities.subheaderTemplate}
      primaryAction={
        actions.onCreate && (
          <Button onClick={actions.onCreate} variant="contained" color="primary" startIcon={<Add />}>
            {t('pages.canvas.add-canvas')}
          </Button>
        )
      }
    >
      <CanvasList entities={entities} actions={actions} state={state} options={options} />
    </DashboardGenericSection>
  );
};
