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
import { SafeInnovationFlowVisualizer } from '../../../platform/admin/templates/InnovationTemplates/SafeInnovationFlowVisualizer';
import Gutters from '../../../../core/ui/grid/Gutters';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { useInnovationFlowTemplateStatesQuery } from '../../../../core/apollo/generated/apollo-hooks';

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
  disabled?: boolean;
  loading?: boolean;
};

export const FormikInnovationFlowSelect: FC<FormikInnovationFlowSelectProps> = ({
  title,
  name,
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

  const handleSelectTemplate = (template: Identifiable) => {
    helpers.setValue(template.id);
  };

  const { data: innovationFlowData, loading: loadingInnovationFlow } = useInnovationFlowTemplateStatesQuery({
    variables: { innovationFlowTemplateID: field.value },
    skip: !field.value,
  });

  const template = innovationFlowData?.lookup.innovationFlowTemplate;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <BlockTitle>{title}</BlockTitle>
        <InnovationFlowTemplatesLibrary onImportTemplate={handleSelectTemplate} disabled={disabled} />
      </Box>
      {(loadingInnovationFlow || loading) && <CircularProgress size={20} />}
      {template && (
        <Gutters>
          <BlockSectionTitle>{template.profile.displayName}</BlockSectionTitle>
          <Text>{template.profile.description}</Text>
          <BlockSectionTitle>{t('components.innovationFlowTemplateSelect.states')}</BlockSectionTitle>
          <DiagramContainer>
            <SafeInnovationFlowVisualizer definition={JSON.stringify(template.states)} />
          </DiagramContainer>
          {helperText && <Caption color="error">{helperText}</Caption>}
        </Gutters>
      )}
    </Box>
  );
};

export default FormikInnovationFlowSelect;
