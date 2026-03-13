import { Box, FormGroup } from '@mui/material';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import SaveButton from '@/core/ui/actions/SaveButton';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { MARKDOWN_TEXT_LENGTH, MID_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownFieldLazy';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import { subdomainValidator } from '@/core/ui/forms/validator/subdomainValidator';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import Gutters from '@/core/ui/grid/Gutters';
import { BlockSectionTitle } from '@/core/ui/typography';
import VisualUpload from '@/core/ui/upload/VisualUpload/VisualUpload';
import { nameOf } from '@/core/utils/nameOf';
import { EmptyTagset, type TagsetModel } from '@/domain/common/tagset/TagsetModel';
import type { VisualModelFull } from '@/domain/common/visual/model/VisualModel';
import { nameSegmentSchema } from '@/domain/platformAdmin/components/Common/NameSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platformAdmin/components/Common/TagsetSegment';

export interface InnovationHubFormValues {
  subdomain: string;
  profile: {
    displayName: string;
    description: string;
    tagline: string;
    tagsets: TagsetModel[];
  };
}

type InnovationHubFormProps = {
  isNew?: boolean;
  subdomain?: string;
  profile?: {
    id?: string;
    displayName?: string;
    description?: string;
    tagline?: string;
    tagset?: TagsetModel;
    visual?: VisualModelFull;
  };

  loading?: boolean;
  onSubmit: (formData: InnovationHubFormValues) => void;
};

const InnovationHubForm = ({ isNew = false, subdomain, profile, loading, onSubmit }: InnovationHubFormProps) => {
  const { t } = useTranslation();

  const profileId = profile?.id ?? '';
  const banner = profile?.visual;

  const initialValues: InnovationHubFormValues = {
    subdomain: subdomain ?? '',
    profile: {
      displayName: profile?.displayName ?? '',
      description: profile?.description ?? '',
      tagline: profile?.tagline ?? '',
      tagsets: [profile?.tagset ?? EmptyTagset],
    },
  };

  const validationSchema = yup.object().shape({
    subdomain: subdomainValidator,
    profile: yup.object().shape({
      displayName: nameSegmentSchema.fields?.displayName ?? displayNameValidator({ required: true }),
      description: MarkdownValidator(MARKDOWN_TEXT_LENGTH, { required: true }),
      tagline: textLengthValidator({ maxLength: MID_TEXT_LENGTH }),
      tagsets: tagsetsSegmentSchema,
    }),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={onSubmit}
    >
      {({ errors, handleSubmit }) => {
        return (
          <Gutters disablePadding={true}>
            <FormikInputField
              name="subdomain"
              title={t('pages.admin.innovationHubs.fields.subdomain')}
              required={true}
              disabled={!isNew}
            />
            <FormikInputField name="profile.displayName" title={t('components.nameSegment.name')} required={true} />
            <FormikInputField
              name="profile.tagline"
              title={t('components.profile.fields.tagline.title')}
              maxLength={MID_TEXT_LENGTH}
            />
            <FormGroup>
              <FormikMarkdownField
                title={t('common.description')}
                name="profile.description"
                maxLength={MARKDOWN_TEXT_LENGTH}
                temporaryLocation={isNew}
              />
            </FormGroup>
            {!isNew && profileId ? (
              <>
                <BlockSectionTitle>{t('common.tags')}</BlockSectionTitle>
                <TagsetSegment name={nameOf<InnovationHubFormValues>('profile.tagsets')} />
                <BlockSectionTitle>{t('components.visualSegment.banner')}</BlockSectionTitle>
                <VisualUpload
                  visual={banner}
                  altText={t(`pages.visualEdit.${VisualType.Banner}.description`, {
                    alternativeText: banner?.alternativeText,
                  })}
                />
              </>
            ) : (
              <BlockSectionTitle>{t('pages.admin.innovationHubs.saveForMoreDetails')}</BlockSectionTitle>
            )}
            <FormGroup>
              <Box display="flex" justifyContent="flex-end">
                <SaveButton
                  loading={loading}
                  disabled={errors && Object.keys(errors).length > 0}
                  onClick={() => handleSubmit()}
                />
              </Box>
            </FormGroup>
          </Gutters>
        );
      }}
    </Formik>
  );
};

export default InnovationHubForm;
