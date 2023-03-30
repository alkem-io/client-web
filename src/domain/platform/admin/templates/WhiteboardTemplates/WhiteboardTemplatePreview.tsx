import { Box, styled, Typography } from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import { SectionSpacer } from '../../../../shared/components/Section/Section';
import WrapperMarkdown from '../../../../../core/ui/markdown/WrapperMarkdown';
import CanvasWhiteboard from '../../../../../common/components/composite/entities/Canvas/CanvasWhiteboard';
import {
  AdminWhiteboardTemplateFragment,
  AdminWhiteboardTemplateValueFragment,
} from '../../../../../core/apollo/generated/graphql-schema';

const TypographyTitle = styled(props => <Typography variant="h6" {...props} />)(() => ({
  fontWeight: 'bold',
}));

interface WhiteboardTemplateViewProps {
  template: AdminWhiteboardTemplateFragment;
  getTemplateValue?: (template: AdminWhiteboardTemplateFragment) => void;
  templateValue?: AdminWhiteboardTemplateValueFragment | undefined;
}

const WhiteboardTemplatePreview = ({
  template,
  getTemplateValue = () => {},
  templateValue,
}: WhiteboardTemplateViewProps) => {
  const { t } = useTranslation();

  const {
    profile: { tagset: { tags } = {}, description = '' },
  } = template;

  useEffect(() => {
    getTemplateValue(template);
  }, [getTemplateValue, template]);

  const canvasFromTemplate = useMemo(() => {
    return {
      id: '__template',
      value: templateValue?.value ?? '',
    };
  }, [templateValue]);

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
        <SectionSpacer half />
        <TagsComponent tags={tags || []} />
      </Box>
      <Box height={theme => theme.spacing(40)}>
        {templateValue?.value && (
          <CanvasWhiteboard
            entities={{
              canvas: canvasFromTemplate,
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
    </>
  );
};

export default WhiteboardTemplatePreview;
