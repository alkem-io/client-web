import React from 'react';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Button, DialogContent } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Gutters from '@/core/ui/grid/Gutters';
import { Caption } from '@/core/ui/typography';
import { Actions } from '@/core/ui/actions/Actions';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { AiPersonaEngine } from '@/core/apollo/generated/graphql-schema';
import ExternalAIComingSoonDialog from './ExternalAIComingSoonDialog';
import FormikAutocomplete from '@/core/ui/forms/FormikAutocomplete';

const PROVIDERS = [
  { id: AiPersonaEngine.OpenaiAssistant, name: 'OpenAI Assistant' },
  { id: AiPersonaEngine.GenericOpenai, name: 'OpenAI' },
];

interface CreateExternalAIDialogProps {
  onClose: () => void;
  onCreateExternal: (externalparams: ExternalVcFormValues) => void;
}

export interface ExternalVcFormValues {
  engine: AiPersonaEngine;
  apiKey: string;
  assistantId?: string;
}

const CreateExternalAIDialog: React.FC<CreateExternalAIDialogProps> = ({ onClose, onCreateExternal }) => {
  const { t } = useTranslation();

  const initialValues: ExternalVcFormValues = {
    engine: AiPersonaEngine.GenericOpenai,
    apiKey: '',
    assistantId: '',
  };

  const validationSchema = yup.object().shape({
    engine: yup
      .string()
      .oneOf(PROVIDERS.map(({ id }) => id))
      .required(),
    apiKey: yup.string().required(),
    assistantId: yup.string().when('engine', (engine, schema) => {
      const value = Array.isArray(engine) ? engine[0] : engine;
      return value === AiPersonaEngine.OpenaiAssistant ? schema.required() : schema;
    }),
  });

  const handleSubmit = async (values: ExternalVcFormValues) => {
    onCreateExternal(values);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      validateOnMount
      onSubmit={(values: ExternalVcFormValues) => handleSubmit(values)}
    >
      {({ isValid, handleChange, values }) => (
        <>
          <DialogHeader title={t('createVirtualContributorWizard.externalAI.create.title')} onClose={onClose} />
          <DialogContent sx={{ paddingTop: 0 }}>
            <Caption alignSelf="center">{t('createVirtualContributorWizard.externalAI.create.subTitle')}</Caption>

            <Form>
              <Gutters disablePadding sx={{ paddingTop: 2, paddingBottom: 2 }}>
                <FormikAutocomplete
                  name="engine"
                  label={t('createVirtualContributorWizard.externalAI.create.provider.title')}
                  title="title"
                  placeholder={t('createVirtualContributorWizard.externalAI.create.provider.placeholder')}
                  values={PROVIDERS}
                />
                <FormikInputField
                  name="apiKey"
                  title={t('createVirtualContributorWizard.externalAI.create.apiKey.label')}
                  placeholder={t('createVirtualContributorWizard.externalAI.create.apiKey.placeholder')}
                  onChange={handleChange}
                />
                {values.engine === AiPersonaEngine.OpenaiAssistant && (
                  <FormikInputField
                    name="assistantId"
                    title={t('createVirtualContributorWizard.externalAI.create.assistantId.label')}
                    placeholder={t('createVirtualContributorWizard.externalAI.create.assistantId.placeholder')}
                    onChange={handleChange}
                  />
                )}
                <Actions justifyContent="end">
                  <Button variant="contained" disabled={!isValid} type="submit">
                    {t('buttons.create')}
                  </Button>
                </Actions>
              </Gutters>
            </Form>
            <ExternalAIComingSoonDialog onClose={onClose} />
          </DialogContent>
        </>
      )}
    </Formik>
  );
};

export default CreateExternalAIDialog;
