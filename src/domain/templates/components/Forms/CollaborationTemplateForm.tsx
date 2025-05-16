import React, { ReactNode, useMemo, useState } from 'react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { FormikHelpers, FormikProps } from 'formik';
import TemplateFormBase, { TemplateFormProfileSubmittedValues } from './TemplateFormBase';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { mapTemplateProfileToUpdateProfileInput } from './common/mappings';
import { BlockSectionTitle } from '@/core/ui/typography';
import { CollaborationTemplate } from '@/domain/templates/models/CollaborationTemplate';
import CollaborationTemplatePreview from '../Previews/CollaborationTemplatePreview';
import { useCollaborationTemplateContentQuery } from '@/core/apollo/generated/apollo-hooks';
import CollaborationFromSpaceUrlForm from './CollaborationFromSpaceUrlForm';

export interface CollaborationTemplateFormSubmittedValues extends TemplateFormProfileSubmittedValues {
  collaborationId?: string;
}

interface CollaborationTemplateFormProps {
  template?: CollaborationTemplate;
  onSubmit: (values: CollaborationTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<CollaborationTemplateFormSubmittedValues>) => ReactNode);
}

const validator = {
  collaborationId: yup.string().required(),
};

/**
 * We have 3 collaborationIds in this component:
 *  - the one coming with the template (template?.collaboration?.id) that never changes (will be undefined if we are creating a new template)
 *  - the one in the formik values (values.collaborationId) we want to change that when the user selects a subspace to serve as template
 *  - the one in the state [collaborationId, setCollaborationId] that we use to query the API and to show the template preview.
 *
 * We cannot unify them because:
 *  - We want to keep the original collaborationId to reset the formik value when the user cancels the selection. also, never change a value coming from the server
 *  - The GraphQL query useCollaborationTemplateContentQuery is outside Formik, so we need to keep the state to trigger the query with the correct value.
 *  - We may be able to do this with lazy queries and an Effect but for now this works pretty well.
 */
const CollaborationTemplateForm = ({ template, onSubmit, actions }: CollaborationTemplateFormProps) => {
  const { t } = useTranslation();

  const [collaborationId, setCollaborationId] = useState<string | undefined>(template?.collaboration?.id);

  const initialValues: CollaborationTemplateFormSubmittedValues = useMemo(
    () => ({
      profile: mapTemplateProfileToUpdateProfileInput(template?.profile),
      collaborationId: template?.collaboration?.id ?? '',
    }),
    [template]
  );

  // Just load the innovation flow and the callouts of the selected collaboration and show it
  const {
    data,
    loading,
    refetch: refetchTemplateContent,
  } = useCollaborationTemplateContentQuery({
    variables: {
      collaborationId: collaborationId!,
    },
    skip: !collaborationId,
  });
  const collaborationPreview = {
    collaboration: data?.lookup.collaboration,
  };
  const handleSubmit = (
    values: CollaborationTemplateFormSubmittedValues,
    { setFieldValue }: FormikHelpers<CollaborationTemplateFormSubmittedValues>
  ) => {
    // Special case: For CollaborationTemplates we change collaborationId in the formik values,
    // to mark that this template should reload its content from another collaboration.
    // That's not real, collaborationId of a template never changes in the server.
    // When we submit the form we call the updateTemplateFromCollaboration mutation with the new collaborationId so the template gets updated.
    // We reset it here to the correct value to avoid Formik detecting the form as dirty on the next render.
    // (dirty means that it will enable the button `Update` as if there were pending changes to save)
    setFieldValue('collaborationId', template?.collaboration?.id); // Set the value back to the original collaborationId

    // With other template types we just pass onSubmit directly to onSubmit
    return onSubmit(values);
  };

  return (
    <TemplateFormBase
      templateType={TemplateType.Collaboration}
      template={template}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      actions={actions}
      validator={validator}
    >
      {({ setFieldValue }) => {
        const handleCollaborationIdChange = async (collaborationId: string) => {
          setFieldValue('collaborationId', collaborationId); // Change the value in Formik
          setCollaborationId(collaborationId); // Refresh the collaboration preview
          if (collaborationId) {
            await refetchTemplateContent({ collaborationId });
          }
        };
        const handleCancel = () => {
          const collaborationId = template?.collaboration?.id;
          if (collaborationId) {
            setFieldValue('collaborationId', collaborationId); // Change the value in Formik back to the template collaboration
            setCollaborationId(collaborationId); // Refresh the collaboration preview
            if (collaborationId) {
              refetchTemplateContent({ collaborationId });
            }
          }
        };
        return (
          <>
            <CollaborationFromSpaceUrlForm
              onUseCollaboration={handleCollaborationIdChange}
              collapsible={Boolean(template?.collaboration?.id)}
              onCollapse={handleCancel}
            />
            <BlockSectionTitle>{t('common.states')}</BlockSectionTitle>
            <CollaborationTemplatePreview loading={loading} template={collaborationPreview} />
          </>
        );
      }}
    </TemplateFormBase>
  );
};

export default CollaborationTemplateForm;
