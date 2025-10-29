import React from 'react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import TemplateFormBase, { TemplateFormProfileSubmittedValues } from './TemplateFormBase';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { CommunityGuidelinesTemplate } from '@/domain/templates/models/CommunityGuidelinesTemplate';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import ProfileReferenceSegment from '@/domain/platformAdmin/components/Common/ProfileReferenceSegment';
import FormikReferenceSegment from '@/domain/platformAdmin/components/Common/FormikReferenceSegment';
import { referenceSegmentSchema } from '@/domain/platformAdmin/components/Common/ReferenceSegment';
import { tagsetsSegmentSchema } from '@/domain/platformAdmin/components/Common/TagsetSegment';
import { mapTemplateProfileToUpdateProfileInput } from './common/mappings';
import { gutters } from '@/core/ui/grid/utils';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import { mapReferenceModelsToUpdateReferenceInputs } from '@/domain/common/reference/ReferenceUtils';
import { TemplateFormProps } from './TemplateForm';

interface TemplateContentGuidelines {
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
}

export interface TemplateCommunityGuidelinesFormSubmittedValues extends TemplateFormProfileSubmittedValues {
  communityGuidelines?: TemplateContentGuidelines;
}

interface TemplateCommunityGuidelinesFormProps
  extends TemplateFormProps<CommunityGuidelinesTemplate, TemplateCommunityGuidelinesFormSubmittedValues> {}

const validator = {
  communityGuidelines: yup.object().shape({
    profile: yup
      .object()
      .shape({
        displayName: displayNameValidator({ required: true }),
        description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
        references: referenceSegmentSchema,
        tagsets: tagsetsSegmentSchema,
      })
      .required(),
  }),
};

const TemplateCommunityGuidelinesForm = ({
  template,
  onSubmit,
  actions,
  temporaryLocation = false,
}: TemplateCommunityGuidelinesFormProps) => {
  const { t } = useTranslation();
  const profileId = template?.communityGuidelines?.profile.id;

  const initialValues: TemplateCommunityGuidelinesFormSubmittedValues = {
    profile: mapTemplateProfileToUpdateProfileInput(template?.profile),
    communityGuidelines: {
      profile: {
        displayName: template?.communityGuidelines?.profile.displayName ?? '',
        description: template?.communityGuidelines?.profile.description ?? '',
        references: mapReferenceModelsToUpdateReferenceInputs(template?.communityGuidelines?.profile.references) ?? [],
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
            temporaryLocation={temporaryLocation}
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

export default TemplateCommunityGuidelinesForm;
