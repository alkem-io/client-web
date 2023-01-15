import { Box, Grid, Typography } from '@mui/material';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CanvasWhiteboard from '../../../../../common/components/composite/entities/Canvas/CanvasWhiteboard';
import { Loading } from '../../../../../common/components/core';
import { CanvasTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { Identifiable } from '../../../../shared/types/Identifiable';
import CanvasList from '../../../canvas/CanvasList/CanvasList';
import { CanvasListItemCanvas } from '../../../canvas/CanvasList/CanvasListItem';

interface CanvasTemplatesListProps {
  actions: {
    onTemplateSelected: (template: Identifiable) => void;
  };
  entities: {
    selectedTemplate: (CanvasTemplateFragment & { value: string }) | undefined;
    templates: CanvasTemplateFragment[];
  };
  state: {
    templatesLoading?: boolean;
    canvasLoading?: boolean;
  };
}

const CanvasTemplatesList: FC<CanvasTemplatesListProps> = ({ actions, entities, state }) => {
  const { templates, selectedTemplate } = entities;

  const { t } = useTranslation();

  const canvasListItems = useMemo<CanvasListItemCanvas[]>(() => {
    return templates.map(({ id, info }) => ({
      id,
      displayName: info.title!,
    }));
  }, [templates]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={5}>
        <Box display="flex" flexDirection="column">
          <Box p={1} />
          <Typography variant="body1">{t('pages.canvas.create-dialog.steps.templating')}</Typography>
          <Box p={1} />
          <CanvasList
            entities={{
              canvases: canvasListItems,
              selectedCanvasId: selectedTemplate?.id,
            }}
            actions={{
              onSelect: template => actions.onTemplateSelected(template),
            }}
            options={{}}
            state={{
              loading: state.templatesLoading,
            }}
          />
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Box display="flex" justifyContent="center" alignItems="center" height={'100%'} minHeight={600} minWidth={450}>
          {!selectedTemplate && !state.canvasLoading && (
            <Typography variant="overline">{t('pages.canvas.create-dialog.no-template-selected')}</Typography>
          )}
          {state.canvasLoading && <Loading text="Loading canvas..." />}
          {selectedTemplate && !state.canvasLoading && (
            <CanvasWhiteboard
              entities={{
                canvas: selectedTemplate,
              }}
              actions={{}}
              options={{
                viewModeEnabled: true,
                UIOptions: {
                  canvasActions: {
                    export: false,
                  },
                },
              }}
            />
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default CanvasTemplatesList;
