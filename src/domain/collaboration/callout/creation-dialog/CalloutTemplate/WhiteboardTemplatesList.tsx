import { Box, Button, Grid, List, Typography } from '@mui/material';
import { FC, useCallback, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CheckIcon from '@mui/icons-material/Check';
import CanvasWhiteboard from '../../../../../common/components/composite/entities/Canvas/CanvasWhiteboard';
import { Loading } from '../../../../../common/components/core';
import { LibraryIcon } from '../../../../../common/icons/LibraryIcon';
import {
  useInnovationPackWhiteboardTemplateWithValueLazyQuery,
  useInnovationPacksLazyQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { AdminWhiteboardTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import CanvasImportTemplateCard from '../../../../platform/admin/templates/WhiteboardTemplates/WhitebaordImportTemplateCard';
import WhiteboardTemplatePreview from '../../../../platform/admin/templates/WhiteboardTemplates/WhiteboardTemplatePreview';
import ImportTemplatesDialog from '../../../../platform/admin/templates/InnovationPacks/ImportTemplatesDialog';
import { TemplateInnovationPackMetaInfo } from '../../../../platform/admin/templates/InnovationPacks/InnovationPack';
import CanvasListItem from '../../../canvas/CanvasList/CanvasListItem';
import { WhiteboardTemplateData } from '../../CalloutForm';
import { WhiteboardTemplateListItem, LibraryWhiteboardTemplate, TemplateOrigin } from './WhiteboardTemplateChooser';
interface WhiteboardTemplatesListProps {
  actions: {
    onSelect: (whiteboardTemplateData: WhiteboardTemplateData) => void;
    updateLibraryTemplates: (template: LibraryWhiteboardTemplate) => void;
  };
  entities: {
    selectedTemplate: (WhiteboardTemplateListItem & { value: string }) | undefined;
    templates: WhiteboardTemplateListItem[];
  };
  state: {
    canvasLoading?: boolean;
  };
}

const formatWhiteboardTemplate = (canvas: WhiteboardTemplateListItem) => ({
  id: canvas.id,
  displayName: canvas.profile.displayName,
});

const WhiteboardTemplatesList: FC<WhiteboardTemplatesListProps> = ({ actions, entities, state }) => {
  const { templates, selectedTemplate } = entities;
  const { t } = useTranslation();

  const [isImportTemplatesDialogOpen, setImportTemplatesDialogOpen] = useState(false);
  const [loadInnovationPacks, { data: innovationPacks, loading: loadingInnovationPacks }] =
    useInnovationPacksLazyQuery();

  const openImportTemplateDialog = useCallback(() => {
    loadInnovationPacks();
    setImportTemplatesDialogOpen(true);
  }, [loadInnovationPacks]);
  const closeImportTemplatesDialog = useCallback(() => setImportTemplatesDialogOpen(false), []);
  const handleTemplateSelect = (canvas: WhiteboardTemplateListItem) => {
    actions.onSelect({
      id: canvas.id,
      displayName: canvas.profile.displayName,
      origin: canvas.origin,
      innovationPackId: canvas.innovationPackId,
    });
  };

  const canvasInnovationPacks = useMemo(() => {
    if (!innovationPacks) return [];
    return innovationPacks?.platform.library.innovationPacks
      .filter(pack => pack.templates && pack.templates?.whiteboardTemplates.length > 0)
      .map(pack => ({
        ...pack,
        templates: pack.templates?.whiteboardTemplates || [],
      }));
  }, [innovationPacks]);

  const handleImportTemplate = async (template: LibraryWhiteboardTemplate) => {
    if (templates.find(templ => templ.profile.displayName === template.profile.displayName)) {
      closeImportTemplatesDialog();
      return;
    }
    actions.updateLibraryTemplates(template);
    const selectedLibraryTemplate = {
      id: template.id,
      profile: { displayName: template.profile.displayName },
      origin: 'Library' as TemplateOrigin,
      innovationPackId: template.innovationPackId,
    };
    handleTemplateSelect(selectedLibraryTemplate);
    closeImportTemplatesDialog();
  };

  const [fetchInnovationPackCanvasValue, { data: importedCanvasValue }] =
    useInnovationPackWhiteboardTemplateWithValueLazyQuery({ fetchPolicy: 'cache-and-network', errorPolicy: 'all' });

  const getImportedTemplateValue = useCallback(
    (template: AdminWhiteboardTemplateFragment & TemplateInnovationPackMetaInfo) => {
      fetchInnovationPackCanvasValue({
        variables: { innovationPackId: template.innovationPackId, whiteboardTemplateId: template.id },
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
                  canvas={formatWhiteboardTemplate(canvas)}
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
            {t('buttons.see-all', { subject: t('common.templates') })}
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
        loading={loadingInnovationPacks}
        dialogSubtitle={t('pages.admin.generic.sections.templates.import.callout-template-import-subtitle')}
        templateImportCardComponent={CanvasImportTemplateCard}
        templatePreviewComponent={WhiteboardTemplatePreview}
        open={isImportTemplatesDialogOpen}
        onClose={closeImportTemplatesDialog}
        onImportTemplate={handleImportTemplate}
        innovationPacks={canvasInnovationPacks}
        getImportedTemplateValue={getImportedTemplateValue}
        importedTemplateValue={importedCanvasValue?.platform.library?.innovationPack?.templates?.whiteboardTemplate}
        actionButton={
          <Button startIcon={<CheckIcon />} variant="contained" sx={{ marginLeft: theme => theme.spacing(1) }}>
            {t('buttons.select')}
          </Button>
        }
      />
    </>
  );
};

export default WhiteboardTemplatesList;
