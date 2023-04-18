import { Button, Dialog, DialogContent, Link } from '@mui/material';
import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LibraryIcon } from '../../../../common/icons/LibraryIcon';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { PostTemplate, PostTemplateMapper, PostTemplateWithValue } from './PostTemplate';
import PostTemplatesLibraryGallery from './PostTemplatesLibraryGallery';
import PostTemplatesLibraryPreview from './PostTemplatesLibraryPreview';
import {
  useHubPostTemplatesLibraryQuery,
  usePlatformPostTemplatesLibraryLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import { compact } from 'lodash';
import Gutters from '../../../../core/ui/grid/Gutters';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogIcon from '../../../../core/ui/dialog/DialogIcon';
import { ImageSearch as ImageSearchIcon } from '@mui/icons-material';
import MultipleSelect from '../../../platform/search/MultipleSelect';

export interface PostTemplatesLibraryProps {
  onSelectTemplate: (template: PostTemplateWithValue) => void;
}

const PostTemplatesLibrary: FC<PostTemplatesLibraryProps> = ({ onSelectTemplate }) => {
  const { t } = useTranslation();
  const { hubNameId } = useUrlParams();

  const [dialogOpen, setDialogOpen] = useState(false);
  const handleClose = () => {
    setDialogOpen(false);
    handleClosePreview();
  };
  const [filter, setFilter] = useState<string[]>([]);

  // Show gallery or show preview of this template:
  const [previewTemplate, setPreviewTemplate] = useState<PostTemplateWithValue>();

  // Hub Templates:
  const { data: hubData, loading: loadingHubTemplates } = useHubPostTemplatesLibraryQuery({
    variables: {
      hubId: hubNameId!,
    },
    skip: !hubNameId,
  });

  // const [fetchPostTemplateValueHub, { loading: loadingHubTemplateValue }] = useHubPostTemplateValueLazyQuery();

  const hubTemplates = useMemo(
    () =>
      hubData?.hub.templates?.postTemplates.map<PostTemplate>(template =>
        PostTemplateMapper(template, hubData?.hub.host?.profile)
      ),
    [hubData]
  );

  const handlePreviewTemplateHub = async (template: PostTemplate) => {
    setPreviewTemplate(template);
  };

  // Platform Templates:
  const [fetchPlatformTemplates, { data: platformData, loading: loadingPlatformTemplates }] =
    usePlatformPostTemplatesLibraryLazyQuery();

  // const [fetchPostTemplateValuePlatform, { loading: loadingPlatformTemplateValue }] =
  //   usePlatformPostTemplateValueLazyQuery();

  useEffect(() => {
    if (!hubNameId) {
      fetchPlatformTemplates();
    }
  }, [hubNameId]);

  const platformTemplates = useMemo(
    () =>
      platformData?.platform.library.innovationPacks.flatMap(ip =>
        compact(
          ip.templates?.postTemplates.map<PostTemplate>(template =>
            PostTemplateMapper(template, ip.provider?.profile, ip)
          )
        )
      ),
    [platformData]
  );

  const handlePreviewTemplatePlatform = async (template: PostTemplate) => {
    setPreviewTemplate(template);
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

  const loading = loadingHubTemplates || loadingPlatformTemplates;

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
          {!previewTemplate ? (
            <Gutters>
              {hubNameId && (
                <>
                  <BlockTitle>{t('canvas-templates.hub-templates')}</BlockTitle>
                  <PostTemplatesLibraryGallery
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
                  <PostTemplatesLibraryGallery
                    canvases={platformTemplates}
                    filter={filter}
                    onPreviewTemplate={template => handlePreviewTemplatePlatform(template)}
                    loading={loadingPlatformTemplates}
                  />
                </>
              )}
            </Gutters>
          ) : (
            <PostTemplatesLibraryPreview
              template={previewTemplate}
              loading={loading}
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

export default PostTemplatesLibrary;
