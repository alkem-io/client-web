import { Box, Grid, List, Typography } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CanvasWhiteboard from '../../../../../common/components/composite/entities/Canvas/CanvasWhiteboard';
import { Loading } from '../../../../../common/components/core';
import { CanvasTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import CanvasListItem from '../../../canvas/CanvasList/CanvasListItem';

interface CanvasTemplatesListProps {
  actions: {
    onSelect: (canvasTemplateTitle: string) => void;
  };
  entities: {
    selectedTemplate: (CanvasTemplateFragment & { value: string }) | undefined;
    templates: CanvasTemplateFragment[];
  };
  state: {
    canvasLoading?: boolean;
  };
}

const CanvasTemplatesList: FC<CanvasTemplatesListProps> = ({ actions, entities, state }) => {
  const { templates, selectedTemplate } = entities;

  const { t } = useTranslation();

  const formatCanvasTemplate = (canvas: CanvasTemplateFragment) => ({ id: canvas.id, displayName: canvas.info.title });

  return (
    <Grid container spacing={2}>
      <Grid item xs={5.5}>
        <Box display="flex" flexDirection="column">
          <List>
            {templates.map(canvas => (
              <CanvasListItem
                key={canvas.id}
                onClick={() => actions.onSelect(canvas.info.title)}
                canvas={formatCanvasTemplate(canvas)}
                isSelected={canvas.id === selectedTemplate?.id}
              />
            ))}
          </List>
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Box display="flex" justifyContent="center" alignItems="center" height={'100%'} minHeight={400} minWidth={450}>
          {!selectedTemplate && !state.canvasLoading && (
            <Typography variant="overline">
              {t('components.callout-creation.template-step.no-canvas-template-selected')}
            </Typography>
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
