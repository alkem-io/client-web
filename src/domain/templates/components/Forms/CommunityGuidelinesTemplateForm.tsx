import { ReactNode } from 'react';

import * as yup from 'yup';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';

import TemplateFormBase, { TemplateFormProfileSubmittedValues } from './TemplateFormBase';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import FormikReferenceSegment from '../../../platform/admin/components/Common/FormikReferenceSegment';
import ProfileReferenceSegment from '../../../platform/admin/components/Common/ProfileReferenceSegment';

import { gutters } from '../../../../core/ui/grid/utils';
import { displayNameValidator } from '../../../../core/ui/forms/validator';
import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import { type CommunityGuidelinesTemplate } from '../../models/CommunityGuidelinesTemplate';
import { tagsetsSegmentSchema } from '../../../platform/admin/components/Common/TagsetSegment';
import { referenceSegmentSchema } from '../../../platform/admin/components/Common/ReferenceSegment';
import { mapReferencesToUpdateReferences, mapTemplateProfileToUpdateProfile } from './common/mappings';

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

const CommunityGuidelinesTemplateForm = ({
  actions,
  template,
  temporaryLocation,
  onSubmit,
}: CommunityGuidelinesTemplateFormProps) => {
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
      actions={actions}
      template={template}
      validator={validator}
      initialValues={initialValues}
      templateType={TemplateType.CommunityGuidelines}
      onSubmit={onSubmit}
    >
      {({ values }) => (
        <>
          <FormikInputField
            name="communityGuidelines.profile.displayName"
            title={t('templateLibrary.communityGuidelinesTemplates.guidelinesTitle')}
          />

          <FormikMarkdownField
            maxLength={MARKDOWN_TEXT_LENGTH}
            temporaryLocation={temporaryLocation}
            name="communityGuidelines.profile.description"
            title={t('templateLibrary.communityGuidelinesTemplates.guidelinesDescription')}
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

type CommunityGuidelinesTemplateFormProps = {
  onSubmit: (values: CommunityGuidelinesTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<CommunityGuidelinesTemplateFormSubmittedValues>) => ReactNode);

  temporaryLocation?: boolean;
  template?: CommunityGuidelinesTemplate;
};

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
