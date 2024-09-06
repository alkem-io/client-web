import React, { ReactNode } from 'react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';
import TemplateFormBase, { TemplateFormProfileSubmittedValues } from './TemplateFormBase';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import { MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { CommunityGuidelinesTemplate } from '../../models/CommunityGuidelinesTemplate';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import ProfileReferenceSegment from '../../../platform/admin/components/Common/ProfileReferenceSegment';
import FormikReferenceSegment from '../../../platform/admin/components/Common/FormikReferenceSegment';
import { referenceSegmentSchema } from '../../../platform/admin/components/Common/ReferenceSegment';
import { tagsetsSegmentSchema } from '../../../platform/admin/components/Common/TagsetSegment';
import { mapReferencesToUpdateReferences, mapTemplateProfileToUpdateProfile } from './common/mappings';
import { gutters } from '../../../../core/ui/grid/utils';
import { displayNameValidator } from '../../../../core/ui/forms/validator';

export interface CommunityGuidelinesTemplateFormSubmittedValues extends TemplateFormProfileSubmittedValues {
  communityGuidelines?: {
    profile: {
      displayName: string;
      description?: string;
      references?: {
        ID: string;
        name?: string;
        description?: string;
        uri?: string;
      }[];
    };
  };
}

interface CommunityGuidelinesTemplateFormProps {
  template?: CommunityGuidelinesTemplate;
  onSubmit: (values: CommunityGuidelinesTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<CommunityGuidelinesTemplateFormSubmittedValues>) => ReactNode);
}

const validator = {
  communityGuidelines: yup.object().shape({
    profile: yup
      .object()
      .shape({
        displayName: displayNameValidator,
        description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
        references: referenceSegmentSchema,
        tagsets: tagsetsSegmentSchema,
      })
      .required(),
  }),
};

const CommunityGuidelinesTemplateForm = ({ template, onSubmit, actions }: CommunityGuidelinesTemplateFormProps) => {
  const { t } = useTranslation();
  const profileId = template?.communityGuidelines?.profile.id;

  const initialValues: CommunityGuidelinesTemplateFormSubmittedValues = {
    profile: mapTemplateProfileToUpdateProfile(template?.profile),
    communityGuidelines: {
      profile: {
        displayName: template?.communityGuidelines?.profile.displayName ?? '',
        description: template?.communityGuidelines?.profile.description ?? '',
        references: mapReferencesToUpdateReferences(template?.communityGuidelines?.profile.references) ?? [],
      },
    },
  };

  return (
    <TemplateFormBase
      templateType={TemplateType.CommunityGuidelines}
      template={template}
      initialValues={initialValues}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
    >
      {({ values }) => (
        <>
          <FormikInputField
            name="communityGuidelines.profile.displayName"
            title={t('templateLibrary.communityGuidelinesTemplates.guidelinesTitle')}
          />
          <FormikMarkdownField
            name="communityGuidelines.profile.description"
            title={t('templateLibrary.communityGuidelinesTemplates.guidelinesDescription')}
            maxLength={MARKDOWN_TEXT_LENGTH}
          />
          {profileId ? (
            <ProfileReferenceSegment
              profileId={profileId}
              compactMode
              fieldName="communityGuidelines.profile.references"
              references={
                values.communityGuidelines?.profile?.references?.map(ref => ({
                  id: ref.ID,
                  name: ref.name ?? '',
                  description: ref.description,
                  uri: ref.uri ?? '',
                })) ?? []
              }
              marginTop={gutters(-1)}
            />
          ) : (
            <FormikReferenceSegment
              compactMode
              fieldName="communityGuidelines.profile.references"
              marginTop={gutters(-1)}
            />
          )}
        </>
      )}
    </TemplateFormBase>
  );
};

export default CommunityGuidelinesTemplateForm;
