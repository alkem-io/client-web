import { Button, Dialog, DialogContent, Link } from '@mui/material';
import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LibraryIcon } from '../../../../common/icons/LibraryIcon';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { WhiteboardTemplate, WhiteboardTemplateMapper, WhiteboardTemplateWithValue } from './WhiteboardTemplate';
import WhiteboardTemplatesLibraryGallery from './WhiteboardTemplatesLibraryGallery';
import WhiteboardTemplatesLibraryPreview from './WhiteboardTemplatesLibraryPreview';
import {
  useHubWhiteboardTemplatesLibraryQuery,
  usePlatformWhiteboardTemplatesLibraryLazyQuery,
  useHubWhiteboardTemplateValueLazyQuery,
  usePlatformWhiteboardTemplateValueLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import { compact } from 'lodash';
import Gutters from '../../../../core/ui/grid/Gutters';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogIcon from '../../../../core/ui/dialog/DialogIcon';
import { ImageSearch as ImageSearchIcon } from '@mui/icons-material';
import MultipleSelect from '../../../platform/search/MultipleSelect';

export interface WhiteboardTemplatesLibraryProps {
  onSelectTemplate: (template: WhiteboardTemplateWithValue) => void;
}

const WhiteboardTemplatesLibrary: FC<WhiteboardTemplatesLibraryProps> = ({ onSelectTemplate }) => {
  const { t } = useTranslation();
  const { hubNameId } = useUrlParams();

  const [dialogOpen, setDialogOpen] = useState(false);
  const handleClose = () => {
    setDialogOpen(false);
    handleClosePreview();
  };
  const [filter, setFilter] = useState<string[]>([]);

  // Show gallery or show preview of this template:
  const [previewTemplate, setPreviewTemplate] = useState<WhiteboardTemplateWithValue>();

  // Hub Templates:
  const { data: hubData, loading: loadingHubTemplates } = useHubWhiteboardTemplatesLibraryQuery({
    variables: {
      hubId: hubNameId!,
    },
    skip: !hubNameId,
  });

  const [fetchWhiteboardTemplateValueHub, { loading: loadingHubTemplateValue }] =
    useHubWhiteboardTemplateValueLazyQuery();

  const hubTemplates = useMemo(
    () =>
      hubData?.hub.templates?.whiteboardTemplates.map<WhiteboardTemplate>(template =>
        WhiteboardTemplateMapper(template, hubData?.hub.host?.profile)
      ),
    [hubData]
  );

  const handlePreviewTemplateHub = async (template: WhiteboardTemplate) => {
    const { data } = await fetchWhiteboardTemplateValueHub({
      variables: {
        hubId: hubNameId!,
        whiteboardTemplateId: template.id,
      },
    });
    const templateValue = data?.hub.templates?.whiteboardTemplate;
    if (templateValue) {
      setPreviewTemplate({
        ...WhiteboardTemplateMapper(templateValue, hubData?.hub.host?.profile),
        value: templateValue.value,
      });
    }
  };

  // Platform Templates:
  const [fetchPlatformTemplates, { data: platformData, loading: loadingPlatformTemplates }] =
    usePlatformWhiteboardTemplatesLibraryLazyQuery();

  const [fetchWhiteboardTemplateValuePlatform, { loading: loadingPlatformTemplateValue }] =
    usePlatformWhiteboardTemplateValueLazyQuery();

  useEffect(() => {
    if (!hubNameId) {
      fetchPlatformTemplates();
    }
  }, [hubNameId]);

  const platformTemplates = useMemo(
    () =>
      platformData?.platform.library.innovationPacks.flatMap(ip =>
        compact(
          ip.templates?.whiteboardTemplates.map<WhiteboardTemplate>(template =>
            WhiteboardTemplateMapper(template, ip.provider?.profile, ip)
          )
        )
      ),
    [platformData]
  );

  const handlePreviewTemplatePlatform = async (template: WhiteboardTemplate) => {
    const { data } = await fetchWhiteboardTemplateValuePlatform({
      variables: {
        innovationPackId: template.innovationPack.id!,
        whiteboardTemplateId: template.id,
      },
    });

    const ip = data?.platform.library.innovationPack;
    const templateValue = ip?.templates?.whiteboardTemplate;
    if (templateValue) {
      setPreviewTemplate({
        ...WhiteboardTemplateMapper(templateValue, ip?.provider?.profile, ip),
        value: templateValue.value,
      });
    }
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
              {hubNameId && (
                <>
                  <BlockTitle>{t('canvas-templates.hub-templates')}</BlockTitle>
                  <WhiteboardTemplatesLibraryGallery
                    canvases={hubTemplates}
                    filter={filter}
                    onPreviewTemplate={template => handlePreviewTemplateHub(template)}
                    loading={loadingHubTemplates}
                  />
                </>
              )}
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
                  <WhiteboardTemplatesLibraryGallery
                    canvases={platformTemplates}
                    filter={filter}
                    onPreviewTemplate={template => handlePreviewTemplatePlatform(template)}
                    loading={loadingPlatformTemplates}
                  />
                </>
              )}
            </Gutters>
          ) : (
            <WhiteboardTemplatesLibraryPreview
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

export default WhiteboardTemplatesLibrary;
