import React, { ReactNode, useMemo, useState } from 'react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { FormikHelpers, FormikProps } from 'formik';
import TemplateFormBase, { TemplateFormProfileSubmittedValues } from './TemplateFormBase';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { mapTemplateProfileToUpdateProfileInput } from './common/mappings';
import { BlockSectionTitle } from '@/core/ui/typography';
import { TemplateContentSpaceModel } from '@/domain/templates/contentSpace/model/TemplateContentSpaceModel';
import { useSpaceInfoForContentSpaceQuery } from '@/core/apollo/generated/apollo-hooks';
import ContentSpaceFromSpaceUrlForm from './SpaceFromSpaceUrlForm';
import { SpaceTemplate } from '../../models/SpaceTemplate';
import { mapInputDataToTemplateContentSpaceModel } from '../../contentSpace/contentSpaceUtils';
import TemplateContentSpacePreview from '../../contentSpace/TemplateContentSpacePreview';

export interface TemplateSpaceFormSubmittedValues extends TemplateFormProfileSubmittedValues {
  selectedSpaceId?: string;
}

export interface TemplateSpaceFormProps {
  template?: SpaceTemplate;
  onSubmit: (values: TemplateSpaceFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<TemplateSpaceFormSubmittedValues>) => ReactNode);
}

const validator = {
  selectedSpaceId: yup.string().required(),
};

/**
 * This form is used for both create and update of Space Template, which is meta data plus TemplateContentSpace.
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
const TemplateSpaceForm = ({ template, onSubmit, actions }: TemplateSpaceFormProps) => {
  const { t } = useTranslation();

  // The space that is selected by URL submitted by the user
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | undefined>(template?.spaceId);

  // Form to have the information to submit to the server in mutation i.e. profile, spaceId to use to create /update the template
  // TemplateId is handled outside of the form.
  const initialValues: TemplateSpaceFormSubmittedValues = useMemo(
    () => ({
      profile: mapTemplateProfileToUpdateProfileInput(template?.profile),
      selectedSpaceId: '', // No initial value, preview comes from the contentSpace of the template
    }),
    [template]
  );

  // Do we actually need this? We do not refetch for the contentSpace, it comes in with the query...
  const {
    data: dataSpace,
    loading: loadingSpace,
    refetch: refetchSpaceInfoForSpaceContent,
  } = useSpaceInfoForContentSpaceQuery({
    variables: {
      spaceId: selectedSpaceId!,
    },
    skip: !selectedSpaceId,
  });

  // Prefer the looked-up space if available, otherwise use the template's contentSpace
  const spaceContentPreview: TemplateContentSpaceModel = useMemo(() => {
    let templateContentSpace = template?.contentSpace;
    if (dataSpace?.lookup?.space) {
      // If we have a space from the query, use it instead of the template's contentSpace
      templateContentSpace = dataSpace.lookup.space;
    }

    return mapInputDataToTemplateContentSpaceModel(templateContentSpace);
  }, [dataSpace, template]);

  // TODO: Fix the logic here
  const handleSubmit = (
    values: TemplateSpaceFormSubmittedValues,
    { setFieldValue }: FormikHelpers<TemplateSpaceFormSubmittedValues>
  ) => {
    // TODO: what is the correct logic below?
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

  const loading = loadingSpace;

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
        const handleSpaceIdChange = async (selectedSpaceId: string) => {
          setFieldValue('selectedSpaceId', selectedSpaceId); // Change the value in Formik
          setSelectedSpaceId(selectedSpaceId); // Refresh the collaboration preview
          if (selectedSpaceId) {
            await refetchSpaceInfoForSpaceContent({ spaceId: selectedSpaceId });
          }
        };
        const handleCancel = () => {
          // do nothing?
        };
        return (
          <>
            <ContentSpaceFromSpaceUrlForm
              onUseSpace={handleSpaceIdChange}
              collapsible={Boolean(spaceContentPreview.collaboration?.id)}
              onCollapse={handleCancel}
            />
            <BlockSectionTitle>{t('common.states')}</BlockSectionTitle>
            <TemplateContentSpacePreview loading={loading} contentSpace={spaceContentPreview} />
          </>
        );
      }}
    </TemplateFormBase>
  );
};

export default TemplateSpaceForm;
