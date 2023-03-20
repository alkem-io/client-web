import { Button, Dialog, DialogContent, Link } from '@mui/material';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LibraryIcon } from '../../../../common/icons/LibraryIcon';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { CanvasTemplate, CanvasTemplateMapper, CanvasTemplateWithValue } from './CanvasTemplate';
import CanvasTemplatesLibraryGallery from './CanvasTemplatesLibraryGallery';
import CanvasTemplatesLibraryPreview from './CanvasTemplatesLibraryPreview';
import {
  useHubCanvasTemplatesLibraryQuery,
  usePlatformCanvasTemplatesLibraryLazyQuery,
  useHubCanvasTemplateValueLazyQuery,
  usePlatformCanvasTemplateValueLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useHub } from '../../../challenge/hub/HubContext/useHub';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import { compact } from 'lodash';
import Gutters from '../../../../core/ui/grid/Gutters';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogIcon from '../../../../core/ui/dialog/DialogIcon';
import { ImageSearch as ImageSearchIcon } from '@mui/icons-material';
import MultipleSelect from '../../../platform/search/MultipleSelect';

export interface CanvasTemplatesLibraryProps {
  onSelectTemplate: (template: CanvasTemplateWithValue) => void;
}

const CanvasTemplatesLibrary: FC<CanvasTemplatesLibraryProps> = ({ onSelectTemplate }) => {
  const { t } = useTranslation();
  const { hubId } = useHub();

  const [dialogOpen, setDialogOpen] = useState(false);
  const handleClose = () => {
    setDialogOpen(false);
    handleClosePreview();
  };
  const [filter, setFilter] = useState<string[]>([]);

  // Show gallery or show preview of this template:
  const [previewTemplate, setPreviewTemplate] = useState<CanvasTemplateWithValue>();

  // Hub Templates:
  const { data: hubData, loading: loadingHubTemplates } = useHubCanvasTemplatesLibraryQuery({
    variables: {
      hubId,
    },
  });

  const [fetchCanvasTemplateValueHub, { loading: loadingHubTemplateValue }] = useHubCanvasTemplateValueLazyQuery();

  const hubTemplates = useMemo(
    () =>
      hubData?.hub.templates?.canvasTemplates.map<CanvasTemplate>(template =>
        CanvasTemplateMapper(template, hubData?.hub.host?.profile)
      ),
    [hubData]
  );

  const handlePreviewTemplateHub = async (template: CanvasTemplate) => {
    fetchCanvasTemplateValueHub({
      variables: {
        hubId,
        canvasTemplateId: template.id,
      },
      onCompleted: data => {
        const templateValue = data?.hub.templates?.canvasTemplate;
        if (templateValue) {
          setPreviewTemplate({
            ...CanvasTemplateMapper(templateValue, hubData?.hub.host?.profile),
            value: templateValue.value,
          });
        }
      },
    });
  };

  // Platform Templates:
  const [fetchPlatformTemplates, { data: platformData, loading: loadingPlatformTemplates }] =
    usePlatformCanvasTemplatesLibraryLazyQuery();

  const [fetchCanvasTemplateValuePlatform, { loading: loadingPlatformTemplateValue }] =
    usePlatformCanvasTemplateValueLazyQuery();

  const platformTemplates = useMemo(
    () =>
      platformData?.platform.library.innovationPacks.flatMap(ip =>
        compact(
          ip.templates?.canvasTemplates.map<CanvasTemplate>(template =>
            CanvasTemplateMapper(template, ip.provider?.profile, ip)
          )
        )
      ),
    [platformData]
  );

  const handlePreviewTemplatePlatform = async (template: CanvasTemplate) => {
    fetchCanvasTemplateValuePlatform({
      variables: {
        innovationPackId: template.innovationPack.id!,
        canvasTemplateId: template.id,
      },
      onCompleted: data => {
        const ip = data?.platform.library.innovationPack;
        const templateValue = ip?.templates?.canvasTemplate;
        if (templateValue) {
          setPreviewTemplate({
            ...CanvasTemplateMapper(templateValue, ip?.provider?.profile, ip),
            value: templateValue.value,
          });
        }
      },
    });
  };

  const handleClosePreview = () => {
    setPreviewTemplate(undefined);
  };

  const handleSelectTemplate = () => {
    if (previewTemplate) {
      onSelectTemplate(previewTemplate);
      handleClose();
    }
  };

  const loading =
    loadingHubTemplates || loadingHubTemplateValue || loadingPlatformTemplates || loadingPlatformTemplateValue;
  const loadingPreview = loadingHubTemplateValue || loadingPlatformTemplateValue;

  return (
    <>
      <Button variant="outlined" startIcon={<LibraryIcon />} onClick={() => setDialogOpen(true)}>
        {t('buttons.find-template')}
      </Button>
      <Dialog
        open={dialogOpen}
        aria-labelledby="canvas-template-dialog"
        onClose={handleClose}
        PaperProps={{ sx: { backgroundColor: 'background.default', width: theme => theme.spacing(150) } }}
        maxWidth={false}
        fullWidth
      >
        <DialogHeader onClose={handleClose} titleContainerProps={{ alignItems: 'center' }}>
          <DialogIcon>
            <LibraryIcon />
          </DialogIcon>
          {t('canvas-templates.template-library')}
          <MultipleSelect
            onChange={terms => setFilter(terms)}
            value={filter}
            minLength={2}
            containerProps={{
              marginLeft: 'auto',
            }}
            inputProps={{ size: 'small' }}
          />
        </DialogHeader>
        <DialogContent>
          {!previewTemplate && !loadingPreview ? (
            <Gutters>
              <BlockTitle>{t('canvas-templates.hub-templates')}</BlockTitle>
              <CanvasTemplatesLibraryGallery
                canvases={hubTemplates}
                filter={filter}
                onPreviewTemplate={template => handlePreviewTemplateHub(template)}
                loading={loadingHubTemplates}
              />
              {!platformTemplates && !loadingPlatformTemplates ? (
                <Link
                  component={Caption}
                  onClick={() => fetchPlatformTemplates()}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{ cursor: 'pointer' }}
                >
                  <ImageSearchIcon /> {t('canvas-templates.load-platform-templates')}
                </Link>
              ) : (
                <>
                  <BlockTitle>{t('canvas-templates.platform-templates')}</BlockTitle>
                  <CanvasTemplatesLibraryGallery
                    canvases={platformTemplates}
                    filter={filter}
                    onPreviewTemplate={template => handlePreviewTemplatePlatform(template)}
                    loading={loadingPlatformTemplates}
                  />
                </>
              )}
            </Gutters>
          ) : (
            <CanvasTemplatesLibraryPreview
              template={previewTemplate}
              loading={loadingPreview}
              onClose={handleClosePreview}
              actions={
                <Button
                  startIcon={<SystemUpdateAltIcon />}
                  variant="contained"
                  sx={{ marginLeft: theme => theme.spacing(1) }}
                  disabled={loading}
                  onClick={handleSelectTemplate}
                >
                  {t('buttons.use')}
                </Button>
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CanvasTemplatesLibrary;
