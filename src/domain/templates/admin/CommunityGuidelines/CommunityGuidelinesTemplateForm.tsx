import { ReactNode } from 'react';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { CreateProfileInput, Visual } from '../../../../core/apollo/generated/graphql-schema';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import { MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import { gutters } from '../../../../core/ui/grid/utils';
import TemplateForm, { TemplateProfileValues } from '../../../platform/admin/InnovationPacks/TemplateForm';
import { referenceSegmentSchema } from '../../../platform/admin/components/Common/ReferenceSegment';
import FormikReferenceSegment from '../../../platform/admin/components/Common/FormikReferenceSegment';
import ProfileReferenceSegment from '../../../platform/admin/components/Common/ProfileReferenceSegment';

export interface CommunityGuidelinesTemplateFormValues extends TemplateProfileValues {
  guidelines: {
    profile?: {
      displayName?: string;
      description?: string;
      // CreateProfileInput expects referencesData, but UpdateProfileInput expects just references
      referencesData?: {
        name: string;
        uri: string;
        description?: string;
      }[];
      references?: {
        id: string;
        name: string;
        uri: string;
        description?: string;
      }[];
    };
  };
}

export interface CommunityGuidelinesTemplateFormSubmittedValues {
  guidelines?: {
    profile?: {
      displayName?: string;
      description?: string;
      references?: {
        id: string;
        name: string;
        uri: string;
      }[];
    };
  };
  profile?: CreateProfileInput;
  visualUri?: string;
  tags?: string[];
}

interface CommunityGuidelinesTemplateFormProps {
  initialValues: Partial<CommunityGuidelinesTemplateFormValues>;
  visual?: Visual;
  onSubmit: (values: CommunityGuidelinesTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<CommunityGuidelinesTemplateFormValues>) => ReactNode);
  profileId?: string;
}

const validator = {
  guidelines: yup.object().shape({
    profile: yup.object().shape({
      displayName: yup.string().required(),
      description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
      references: referenceSegmentSchema,
    }),
  }),
};

const CommunityGuidelinesTemplateForm = ({
  initialValues,
  visual,
  onSubmit,
  actions,
  profileId, // If we have a profileId means we are editing an existing CG template
}: CommunityGuidelinesTemplateFormProps) => {
  const { t } = useTranslation();
  return (
    <TemplateForm
      initialValues={initialValues}
      visual={visual}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
      entityTypeName={t('templateLibrary.communityGuidelinesTemplates.name')}
    >
      {({ values }) => (
        <>
          <FormikInputField
            name="guidelines.profile.displayName"
            title={t('templateLibrary.communityGuidelinesTemplates.guidelinesTitle')}
          />
          <FormikMarkdownField
            name="guidelines.profile.description"
            title={t('templateLibrary.communityGuidelinesTemplates.guidelinesDescription')}
            maxLength={MARKDOWN_TEXT_LENGTH}
          />
          {profileId ? (
            <ProfileReferenceSegment
              profileId={profileId}
              compactMode
              fieldName="guidelines.profile.references"
              references={values.guidelines?.profile?.references ?? []}
              marginTop={gutters(-1)}
            />
          ) : (
            <FormikReferenceSegment compactMode fieldName="guidelines.profile.referencesData" marginTop={gutters(-1)} />
          )}
        </>
      )}
    </TemplateForm>
  );
};

export default CommunityGuidelinesTemplateForm;
