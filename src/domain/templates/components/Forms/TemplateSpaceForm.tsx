import React, { ReactNode, useMemo, useState } from 'react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { FormikHelpers, FormikProps } from 'formik';
import TemplateFormBase, { TemplateFormProfileSubmittedValues } from './TemplateFormBase';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { mapTemplateProfileToUpdateProfileInput } from './common/mappings';
import { BlockSectionTitle } from '@/core/ui/typography';
import { SpaceTemplate } from '@/domain/templates/models/SpaceTemplate';
import TemplateContentSpacePreview from '../Previews/TemplateContentSpacePreview';
import { useSpaceTemplateContentQuery } from '@/core/apollo/generated/apollo-hooks';
import SpaceContentFromSpaceUrlForm from './SpaceContentFromSpaceUrlForm';

export interface TemplateSpaceFormSubmittedValues extends TemplateFormProfileSubmittedValues {
  spaceId?: string;
}

interface TemplateSpaceFormProps {
  template?: SpaceTemplate;
  onSubmit: (values: TemplateSpaceFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<TemplateSpaceFormSubmittedValues>) => ReactNode);
}

const validator = {
  spaceId: yup.string().required(),
};

/* This form is used for both create and update of Space Template, which is meta data plus TemplateContentSpace.
 *
 * The preview component needs to show Template Content Space.
 * The preview is populated with either the current contentSpace or the selected space (mapped to contentSpace)
 * The selection component should store a SpaceId, used for both create + update.
 *
 * We have two spaceIds in this component:
 * - the one in the state [spaceId, setSpaceId] that we use to query the API and to populate show the template preview.
 * - the one in the formik values (values.spaceId) we want to change that when the user selects a space to serve as template (as the )
 *
 * a ContentSpace preview:
 * - the one coming with the template (template?.contentSpace?.id) that never changes (will be undefined if we are creating a new template)
 *
 * We cannot unify them because:
 *  - We want to keep the original spaceId to reset the formik value when the user cancels the selection. also, never change a value coming from the server
 *  - The GraphQL query useTemplateContentSpaceQuery is outside Formik, so we need to keep the state to trigger the query with the correct value.
 *  - We may be able to do this with lazy queries and an Effect but for now this works pretty well.
 */
const TemplateSpaceForm = ({ template, onSubmit, actions }: TemplateSpaceFormProps) => {
  const { t } = useTranslation();

  const [spaceId, setSpaceId] = useState<string | undefined>(template?.spaceId);

  const initialValues: TemplateSpaceFormSubmittedValues = useMemo(
    () => ({
      profile: mapTemplateProfileToUpdateProfileInput(template?.profile),
      spaceId: template?.spaceId ?? '',
    }),
    [template]
  );

  // Just load the innovation flow and the callouts of the selected collaboration and show it
  const {
    data,
    loading,
    refetch: refetchTemplateContent,
  } = useSpaceTemplateContentQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });
  const spacePreview = {
    contentSpace: data?.lookup.space,
  };

  const handleSubmit = (
    values: TemplateSpaceFormSubmittedValues,
    { setFieldValue }: FormikHelpers<TemplateSpaceFormSubmittedValues>
  ) => {
    // Special case: For SpaceTemplates we change spaceId in the formik values,
    // to mark that this template should reload its content from another space.
    // That's not real, spaceId of a template never changes in the server.
    // When we submit the form we call the updateTemplateFromSpace mutation with the new spaceId so the template gets updated.
    // We reset it here to the correct value to avoid Formik detecting the form as dirty on the next render.
    // (dirty means that it will enable the button `Update` as if there were pending changes to save)
    setFieldValue('spaceId', template?.spaceId); // Set the value back to the original spaceId

    // With other template types we just pass onSubmit directly to onSubmit
    return onSubmit(values);
  };

  return (
    <TemplateFormBase
      templateType={TemplateType.Space}
      template={template}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      actions={actions}
      validator={validator}
    >
      {({ setFieldValue }) => {
        const handleSpaceIdChange = async (spaceId: string) => {
          setFieldValue('spaceId', spaceId); // Change the value in Formik
          setSpaceId(spaceId); // Refresh the space content preview
          if (spaceId) {
            await refetchTemplateContent({ spaceId });
          }
        };
        const handleCancel = () => {
          const spaceId = template?.spaceId;
          if (spaceId) {
            setFieldValue('spaceId', spaceId);
            setSpaceId(spaceId); // Refresh the space content preview
            if (spaceId) {
              refetchTemplateContent({ spaceId });
            }
          }
        };
        return (
          <>
            <SpaceContentFromSpaceUrlForm
              onUseSpace={handleSpaceIdChange}
              collapsible={Boolean(template?.spaceId)}
              onCollapse={handleCancel}
            />
            <BlockSectionTitle>{t('common.states')}</BlockSectionTitle>
            <TemplateContentSpacePreview loading={loading} template={spacePreview} />
          </>
        );
      }}
    </TemplateFormBase>
  );
};

export default TemplateSpaceForm;
