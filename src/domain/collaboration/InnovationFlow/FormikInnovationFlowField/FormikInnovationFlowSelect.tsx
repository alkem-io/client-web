import React, { FC, useMemo } from 'react';
import { useField } from 'formik';
import { Box, TextFieldProps, styled } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress/CircularProgress';
import { DistributiveOmit } from '@mui/types';
import { useValidationMessageTranslation } from '../../../../domain/shared/i18n/ValidationMessageTranslation';
import TranslationKey from '../../../../core/i18n/utils/TranslationKey';
import { BlockSectionTitle, BlockTitle, Caption, Text } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import InnovationFlowTemplatesLibrary from '../InnovationFlowTemplatesLibrary/InnovationFlowTemplatesLibrary';
import { InnovationFlowTemplate } from '../InnovationFlowTemplateCard/InnovationFlowTemplate';
import { useInnovationFlowTemplateDefinitionQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { InnovationFlowType } from '../../../../core/apollo/generated/graphql-schema';
import { SafeInnovationFlowVisualizer } from '../../../platform/admin/templates/InnovationTemplates/SafeInnovationFlowVisualizer';
import Gutters from '../../../../core/ui/grid/Gutters';

const DiagramContainer = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
  [theme.breakpoints.up('md')]: {
    width: '75%',
  },
  overflow: 'hidden',
  '> svg': {
    marginTop: '-10%',
  },
}));

export type FormikInnovationFlowSelectProps = DistributiveOmit<TextFieldProps, 'variant'> & {
  title: string;
  name: string;
  type: InnovationFlowType;
  disabled?: boolean;
  loading?: boolean;
};

export const FormikInnovationFlowSelect: FC<FormikInnovationFlowSelectProps> = ({
  title,
  name,
  type,
  disabled = false,
  loading,
}) => {
  const { t } = useTranslation();
  const [field, meta, helpers] = useField(name);

  const tErr = useValidationMessageTranslation();
  const isError = Boolean(meta.error) && meta.touched;
  const helperText = useMemo(() => {
    return tErr(meta.error as TranslationKey, { field: title });
  }, [isError, meta.error, tErr, title]);

  const handleSelectTemplate = (template: InnovationFlowTemplate) => {
    helpers.setValue(template.id);
  };
  const { data: innovationFlowData, loading: loadingInnovationFlow } = useInnovationFlowTemplateDefinitionQuery({
    variables: { innovationFlowTemplateID: field.value },
    skip: !field.value,
  });

  const template = innovationFlowData?.lookup.innovationFlowTemplate;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <BlockTitle>{title}</BlockTitle>
        <InnovationFlowTemplatesLibrary onSelectTemplate={handleSelectTemplate} filterType={type} disabled={disabled} />
      </Box>
      {(loadingInnovationFlow || loading) && <CircularProgress size={20} />}
      {template && (
        <Gutters>
          <BlockSectionTitle>{template.profile.displayName}</BlockSectionTitle>
          <Text>{template.profile.description}</Text>
          <BlockSectionTitle>{t('components.innovationFlowTemplateSelect.states')}</BlockSectionTitle>
          <DiagramContainer>
            <SafeInnovationFlowVisualizer definition={template.definition} />
          </DiagramContainer>
          {helperText && <Caption color="error">{helperText}</Caption>}
        </Gutters>
      )}
    </Box>
  );
};

export default FormikInnovationFlowSelect;
