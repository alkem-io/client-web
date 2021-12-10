import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CanvasList from '../../components/composite/lists/Canvas/CanvasList';
import Section from '../../components/core/Section/Section';
import SectionHeader from '../../components/core/Section/SectionHeader';
import { CanvasWithoutValue } from '../../models/entities/canvas';
import { ViewProps } from '../../models/view';

interface CanvasListViewEntities {
  canvases: CanvasWithoutValue[];
  headerTemplate: string;
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
    <Section>
      <SectionHeader text={t(entities.headerTemplate as any)}>
        {actions.onCreate && (
          <Button onClick={actions.onCreate} startIcon={<Add />}>
            {t('pages.canvas.add-canvas')}
          </Button>
        )}
      </SectionHeader>
      <CanvasList entities={entities} actions={actions} state={state} options={options} />
    </Section>
  );
};
