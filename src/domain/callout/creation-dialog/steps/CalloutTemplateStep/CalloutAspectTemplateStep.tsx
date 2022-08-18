import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Skeleton, styled,
  Typography,
} from '@mui/material';
import Markdown from '../../../../../components/core/Markdown';
import { SectionSpacer } from '../../../../shared/components/Section/Section';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import { TemplateListWithPreview } from './TemplateListWithPreview';
import {
  useAspectTemplatesOnCalloutCreationQuery,
  useAspectTemplateValueQuery,
} from '../../../../../hooks/generated/graphql';
import { CalloutType } from '../../../../../models/graphql-schema';
import { CalloutTemplateStepProps } from './CalloutTemplateStepProps';
import { useHub } from '../../../../hub/HubContext/useHub';

export interface CalloutAspectTemplateStepProps extends CalloutTemplateStepProps {}

const CalloutAspectTemplateStep: FC<CalloutAspectTemplateStepProps> = ({ callout, onChange }) => {
  const { hubId } = useHub();

  const { data: hubAspectTemplates, loading: aspectTemplatesLoading } = useAspectTemplatesOnCalloutCreationQuery({
    variables: { hubId },
    skip: callout.type !== CalloutType.Card
  });
  const aspectTemplates = hubAspectTemplates?.hub?.templates?.aspectTemplates?.map(x => ({ id: x.id, title: x.info.title })) ?? [];

  const { data: aspectTemplateData, loading: aspectTemplateValueLoading } = useAspectTemplateValueQuery({
    variables: { hubId, id: callout.templateId! },
    skip: callout.type !== CalloutType.Card || !callout.templateId,
  });
  const { type = '', defaultDescription = '', info } = aspectTemplateData?.hub?.templates?.aspectTemplate ?? {};
  const { description = '', tagset } = info ?? {};
  const tags = tagset?.tags ?? [];

  return (
    <TemplateListWithPreview
      templates={aspectTemplates}
      loading={aspectTemplatesLoading}
      selectedTemplateId={callout?.templateId}
      onSelection={onChange}
      templatePreviewComponent={
        <AspectPreview
          defaultDescription={defaultDescription}
          description={description}
          tags={tags}
          aspectTemplateType={type}
          loading={aspectTemplateValueLoading}
        />
      }
    />
  );
};
export default CalloutAspectTemplateStep;

interface AspectPreviewProps {
  description: string;
  tags: string[] | undefined;
  aspectTemplateType: string;
  defaultDescription: string;
  loading: boolean | undefined;
}

const AspectPreview: FC<AspectPreviewProps> = ({ description, tags, aspectTemplateType, defaultDescription, loading }) => {
  const { t } = useTranslation();

  return (
    <>
      <Box>
        <TypographyTitle>{t('common.description')}</TypographyTitle>
        <Typography variant="body2" component="div">
          {loading ? (
            <>
              <Skeleton />
              <Skeleton />
            </>
          ) : (
            <Markdown>{description}</Markdown>
          )}
        </Typography>
      </Box>
      <Box>
        <TypographyTitle>{t('common.tags')}</TypographyTitle>
        <SectionSpacer half />
        <TagsComponent tags={tags || []} loading={loading} />
      </Box>
      <Box>
        <TypographyTitle>{t('aspect-edit.type.title')}</TypographyTitle>
        <Typography variant="h6" color="primary">
          {loading ? <Skeleton width="30%" /> : aspectTemplateType}
        </Typography>
      </Box>
      <Box>
        <TypographyTitle>{t('aspect-templates.default-description')}</TypographyTitle>
        <Typography variant="body2" component="div">
          {loading ? <Skeleton /> : <Markdown>{defaultDescription}</Markdown>}
        </Typography>
      </Box>
    </>
  )
};

const TypographyTitle = styled(props => <Typography variant="h6" {...props} />)(() => ({
  fontWeight: 'bold',
}));