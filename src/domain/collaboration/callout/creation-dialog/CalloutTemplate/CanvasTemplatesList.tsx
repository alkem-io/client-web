import { Box, Button, Grid, List, Typography } from '@mui/material';
import { FC, useCallback, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CanvasWhiteboard from '../../../../../common/components/composite/entities/Canvas/CanvasWhiteboard';
import { Loading } from '../../../../../common/components/core';
import { LibraryIcon } from '../../../../../common/icons/LibraryIcon';
import {
  useInnovationPackCanvasTemplateWithValueLazyQuery,
  useInnovationPacksLazyQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { AdminCanvasTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import CanvasImportTemplateCard from '../../../../platform/admin/templates/CanvasTemplates/CanvasImportTemplateCard';
import CanvasTemplatePreview from '../../../../platform/admin/templates/CanvasTemplates/CanvasTemplatePreview';
import ImportTemplatesDialog from '../../../../platform/admin/templates/InnovationPacks/ImportTemplatesDialog';
import { TemplateInnovationPackMetaInfo } from '../../../../platform/admin/templates/InnovationPacks/InnovationPack';
import CanvasListItem from '../../../canvas/CanvasList/CanvasListItem';
import { CanvasTemplateData } from '../../CalloutForm';
import { CanvasTemplateListItem, LibraryCanvasTemplate, TemplateOrigin } from './CanvasTemplateChooser';
interface CanvasTemplatesListProps {
  actions: {
    onSelect: (canvasTemplateData: CanvasTemplateData) => void;
    updateLibraryTemplates: (template: LibraryCanvasTemplate) => void;
  };
  entities: {
    selectedTemplate: (CanvasTemplateListItem & { value: string }) | undefined;
    templates: CanvasTemplateListItem[];
  };
  state: {
    canvasLoading?: boolean;
  };
}

const formatCanvasTemplate = (canvas: CanvasTemplateListItem) => ({ id: canvas.id, displayName: canvas.info.title });

const CanvasTemplatesList: FC<CanvasTemplatesListProps> = ({ actions, entities, state }) => {
  const { templates, selectedTemplate } = entities;
  const { t } = useTranslation();

  const [isImportTemplatesDialogOpen, setImportTemplatesDialogOpen] = useState(false);
  const [loadInnovationPacks, { data: innovationPacks }] = useInnovationPacksLazyQuery();

  const openImportTemplateDialog = useCallback(() => {
    loadInnovationPacks();
    setImportTemplatesDialogOpen(true);
  }, [loadInnovationPacks]);
  const closeImportTemplatesDialog = useCallback(() => setImportTemplatesDialogOpen(false), []);
  const handleTemplateSelect = (canvas: CanvasTemplateListItem) => {
    actions.onSelect({
      id: canvas.id,
      title: canvas.info.title,
      origin: canvas.origin,
      innovationPackId: canvas.innovationPackId,
    });
  };

  const canvasInnovationPacks = useMemo(() => {
    if (!innovationPacks) return [];
    return innovationPacks?.platform.library.innovationPacks
      .filter(pack => pack.templates && pack.templates?.canvasTemplates.length > 0)
      .map(pack => ({
        ...pack,
        templates: pack.templates?.canvasTemplates || [],
      }));
  }, [innovationPacks]);

  const handleImportTemplate = async (template: LibraryCanvasTemplate) => {
    if (templates.find(templ => templ.id === template.id)) return;
    actions.updateLibraryTemplates(template);
    const selectedLibraryTemplate = {
      id: template.id,
      info: { title: template.info.title },
      origin: 'Library' as TemplateOrigin,
      innovationPackId: template.innovationPackId,
    };
    handleTemplateSelect(selectedLibraryTemplate);
  };

  const [fetchInnovationPackCanvasValue, { data: importedCanvasValue }] =
    useInnovationPackCanvasTemplateWithValueLazyQuery({ fetchPolicy: 'cache-and-network', errorPolicy: 'all' });

  const getImportedTemplateValue = useCallback(
    (template: AdminCanvasTemplateFragment & TemplateInnovationPackMetaInfo) => {
      fetchInnovationPackCanvasValue({
        variables: { innovationPackId: template.innovationPackId, canvasTemplateId: template.id },
      });
    },
    [fetchInnovationPackCanvasValue]
  );

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={5.5} display="flex" flexDirection="column" justifyContent="space-between">
          <Box>
            <List>
              {templates.map(canvas => (
                <CanvasListItem
                  key={canvas.id}
                  onClick={() => handleTemplateSelect(canvas)}
                  canvas={formatCanvasTemplate(canvas)}
                  isSelected={canvas.id === selectedTemplate?.id}
                />
              ))}
            </List>
          </Box>
          <Button
            onClick={openImportTemplateDialog}
            sx={{ marginRight: theme => theme.spacing(1) }}
            startIcon={<LibraryIcon />}
          >
            {t('buttons.more-templates')}
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={'100%'}
            minHeight={400}
            minWidth={450}
          >
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
      <ImportTemplatesDialog
        headerText={t('pages.admin.generic.sections.templates.import.title', {
          templateType: t('common.canvases'),
        })}
        templateImportCardComponent={CanvasImportTemplateCard}
        templatePreviewComponent={CanvasTemplatePreview}
        open={isImportTemplatesDialogOpen}
        onClose={closeImportTemplatesDialog}
        onImportTemplate={handleImportTemplate}
        innovationPacks={canvasInnovationPacks}
        getImportedTemplateValue={getImportedTemplateValue}
        importedTemplateValue={importedCanvasValue?.platform.library?.innovationPack?.templates?.canvasTemplate}
      />
    </>
  );
};

export default CanvasTemplatesList;
