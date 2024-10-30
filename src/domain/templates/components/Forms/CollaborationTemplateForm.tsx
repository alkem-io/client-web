import React, { ReactNode, useMemo, useState } from 'react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';
import TemplateFormBase, { TemplateFormProfileSubmittedValues } from './TemplateFormBase';
import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { mapTemplateProfileToUpdateProfile } from './common/mappings';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import { CollaborationTemplate } from '../../models/CollaborationTemplate';
import CollaborationTemplatePreview from '../Previews/CollaborationTemplatePreview';
import { useCollaborationTemplateContentQuery } from '../../../../core/apollo/generated/apollo-hooks';
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

const CollaborationTemplateForm = ({ template, onSubmit, actions }: CollaborationTemplateFormProps) => {
  const { t } = useTranslation();

  const [collaborationId, setCollaborationId] = useState<string | undefined>(template?.collaboration?.id);

  const initialValues: CollaborationTemplateFormSubmittedValues = useMemo(
    () => ({
      profile: mapTemplateProfileToUpdateProfile(template?.profile),
      collaborationId: collaborationId ?? '',
    }),
    [collaborationId, template]
  );

  // Just load the innovation flow and the callouts of the selected collaboration and show it
  const { data, loading } = useCollaborationTemplateContentQuery({
    variables: {
      collaborationId: collaborationId!,
    },
    skip: !collaborationId,
  });
  const collaborationPreview = {
    collaboration: data?.lookup.collaboration,
  };

  return (
    <TemplateFormBase
      templateType={TemplateType.Collaboration}
      template={template}
      initialValues={initialValues}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
    >
      {() => {
        return (
          <>
            {!template?.collaboration?.id && (
              <CollaborationFromSpaceUrlForm
                onUseCollaboration={async collaborationId => {
                  setCollaborationId(collaborationId);
                }}
              />
            )}
            <BlockSectionTitle>{t('common.states')}</BlockSectionTitle>
            <CollaborationTemplatePreview loading={loading} template={collaborationPreview} />
          </>
        );
      }}
    </TemplateFormBase>
  );
};

export default CollaborationTemplateForm;
