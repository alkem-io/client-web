import { Box, styled, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import WrapperMarkdown from '../../../../../core/ui/markdown/WrapperMarkdown';
import ExcalidrawWrapper from '../../../../common/whiteboard/excalidraw/ExcalidrawWrapper';
import { AdminWhiteboardTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import useWhiteboardFilesManager from '../../../../common/whiteboard/excalidraw/useWhiteboardFilesManager';
import { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/types/types';

const TypographyTitle = styled(props => <Typography variant="h6" {...props} />)(() => ({
  fontWeight: 'bold',
}));

interface WhiteboardTemplateViewProps {
  template: AdminWhiteboardTemplateFragment;
  getTemplateContent?: (template: AdminWhiteboardTemplateFragment) => void;
  templateContent?: { content: string | undefined } | undefined;
}

const AdminWhiteboardTemplatePreview = ({
  template,
  getTemplateContent = () => {},
  templateContent,
}: WhiteboardTemplateViewProps) => {
  const { t } = useTranslation();
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const filesManager = useWhiteboardFilesManager({ excalidrawAPI });

  const {
    profile: { tagset: { tags } = {}, description = '' },
  } = template;

  useEffect(() => {
    getTemplateContent(template);
  }, [getTemplateContent, template]);

  const whiteboardFromTemplate = useMemo(() => {
    return {
      id: '__template',
      content: templateContent?.content ?? '',
    };
  }, [templateContent]);

  return (
    <>
      <Box>
        <TypographyTitle>{t('common.description')}</TypographyTitle>
        <Typography variant="body2" component="div">
          <WrapperMarkdown>{description}</WrapperMarkdown>
        </Typography>
      </Box>
      <Box>
        <TypographyTitle>{t('common.tags')}</TypographyTitle>
        <TagsComponent tags={tags || []} />
      </Box>
      <Box height={theme => theme.spacing(40)}>
        {templateContent?.content && (
          <ExcalidrawWrapper
            entities={{
              whiteboard: whiteboardFromTemplate,
              filesManager,
            }}
            actions={{
              onInitApi: setExcalidrawAPI,
            }}
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
    </>
  );
};

export default AdminWhiteboardTemplatePreview;
