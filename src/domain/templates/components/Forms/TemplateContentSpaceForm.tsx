import React, { ReactNode, useMemo, useState } from 'react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { FormikHelpers, FormikProps } from 'formik';
import TemplateFormBase, { TemplateFormProfileSubmittedValues } from './TemplateFormBase';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { mapTemplateProfileToUpdateProfileInput } from './common/mappings';
import { BlockSectionTitle } from '@/core/ui/typography';
import { TemplateContentSpaceModel } from '@/domain/templates/contentSpace/TemplateContentSpaceModel';
import SpaceContentTemplatePreview from '../Previews/TemplateContentSpacePreview';
import { useSpaceInfoForContentSpaceQuery, useTemplateContentSpaceQuery } from '@/core/apollo/generated/apollo-hooks';
import ContentSpaceFromSpaceUrlForm from './SpaceFromSpaceUrlForm';
import { SpaceTemplateModel } from '../../models/SpaceTemplate';
import { mapInputDataToTemplateContentSpaceModel } from '../../contentSpace/contentSpaceUtils';

export interface TemplateContentSpaceFormSubmittedValues extends TemplateFormProfileSubmittedValues {
  contentSpaceId?: string;
}

interface TemplateContentSpaceFormProps {
  template?: SpaceTemplateModel;
  onSubmit: (values: TemplateContentSpaceFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<TemplateContentSpaceFormSubmittedValues>) => ReactNode);
}

const validator = {
  collaborationId: yup.string().required(),
};

/**
 * This form is used for both create and update of Content Space.
 *
 * The preview component needs to show Content Space.
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
 * A preview of the contentSpace is also shown:
 *
 * We cannot unify them because:
 *  - We want to keep the original spaceId to reset the formik value when the user cancels the selection. also, never change a value coming from the server
 *  - The GraphQL query useTemplateContentSpaceQuery is outside Formik, so we need to keep the state to trigger the query with the correct value.
 *  - We may be able to do this with lazy queries and an Effect but for now this works pretty well.
 */
const TemplateContentSpaceForm = ({ template, onSubmit, actions }: TemplateContentSpaceFormProps) => {
  const { t } = useTranslation();

  // The space that is selected by URL submitted by the user
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | undefined>(undefined);

  // Form to have the information to submit to the server in mutation i.e. profile, spaceId to use to create /update the template
  // TemplateId is handled outside of the form.
  const initialValues: TemplateContentSpaceFormSubmittedValues = useMemo(
    () => ({
      profile: mapTemplateProfileToUpdateProfileInput(template?.profile),
      spaceId: '', // No initial value, preview comes from the contentSpace of the template
    }),
    [template]
  );

  // Just load the innovation flow and the callouts of the selected collaboration and show it
  const {
    data: dataContentSpace,
    loading: loadingContentSpace,
    refetch: refetchTemplateContentSpace,
  } = useTemplateContentSpaceQuery({
    variables: {
      templateContentSpaceId: template?.contentSpace?.id!,
    },
    skip: !template?.contentSpace?.id,
  });

  // Do we actually need this? We do not refetch for the contentSpace, it comes in with the query...
  const {
    data: dataSpace,
    loading: loadingSpace,
    // refetch: refetchSpaceInfoForSpaceContent,
  } = useSpaceInfoForContentSpaceQuery({
    variables: {
      spaceId: selectedSpaceId!,
    },
    skip: !selectedSpaceId,
  });

  // Map the data from the query to the TemplateContentSpaceModel
  const spaceContentPreview: TemplateContentSpaceModel = mapInputDataToTemplateContentSpaceModel(
    dataContentSpace?.lookup.templateContentSpace || dataSpace?.lookup.space
  );

  const handleSubmit = (
    values: TemplateContentSpaceFormSubmittedValues,
    { setFieldValue }: FormikHelpers<TemplateContentSpaceFormSubmittedValues>
  ) => {
    // Special case: For CollaborationTemplates we change collaborationId in the formik values,
    // to mark that this template should reload its content from another collaboration.
    // That's not real, collaborationId of a template never changes in the server.
    // When we submit the form we call the updateTemplateFromCollaboration mutation with the new collaborationId so the template gets updated.
    // We reset it here to the correct value to avoid Formik detecting the form as dirty on the next render.
    // (dirty means that it will enable the button `Update` as if there were pending changes to save)
    setFieldValue('spaceContentId', template?.contentSpace?.id); // Set the value back to the original collaborationId

    // With other template types we just pass onSubmit directly to onSubmit
    return onSubmit(values);
  };

  const loading = loadingContentSpace || loadingSpace;

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
          setSelectedSpaceId(spaceId); // Refresh the collaboration preview
          if (spaceId) {
            await refetchTemplateContentSpace({ templateContentSpaceId: spaceId });
          }
        };
        const handleCancel = () => {
          // FIXME:
          const spaceId = template?.contentSpace?.id;
          if (spaceId) {
            setFieldValue('spaceId', spaceId); // Change the value in Formik back to the template collaboration
            setSelectedSpaceId(spaceId); // Refresh the collaboration preview
            if (spaceId) {
              refetchTemplateContentSpace({ templateContentSpaceId: spaceId });
            }
          }
        };
        return (
          <>
            <ContentSpaceFromSpaceUrlForm
              onUseSpace={handleSpaceIdChange}
              collapsible={Boolean(template?.contentSpace?.collaboration?.id)}
              onCollapse={handleCancel}
            />
            <BlockSectionTitle>{t('common.states')}</BlockSectionTitle>
            <SpaceContentTemplatePreview loading={loading} contentSpace={spaceContentPreview} />
          </>
        );
      }}
    </TemplateFormBase>
  );
};

export default TemplateContentSpaceForm;
