import { Box, FormGroup } from '@mui/material';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { nameSegmentSchema } from '@/domain/platformAdmin/components/Common/NameSegment';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MID_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { BlockSectionTitle } from '@/core/ui/typography';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platformAdmin/components/Common/TagsetSegment';
import SaveButton from '@/core/ui/actions/SaveButton';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { subdomainValidator } from '@/core/ui/forms/validator/subdomainValidator';
import VisualUpload from '@/core/ui/upload/VisualUpload/VisualUpload';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import Gutters from '@/core/ui/grid/Gutters';
import { EmptyTagset, TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { VisualModelFull } from '@/domain/common/visual/model/VisualModel';
import { nameOf } from '@/core/utils/nameOf';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';

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
      displayName: nameSegmentSchema.fields?.displayName ?? yup.string(),
      description: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
      tagline: textLengthValidator({ maxLength: MID_TEXT_LENGTH }),
      tagsets: tagsetsSegmentSchema,
    }),
  });

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={onSubmit}>
      {({ errors, handleSubmit }) => {
        return (
          <Gutters disablePadding>
            <FormikInputField
              name="subdomain"
              title={t('pages.admin.innovationHubs.fields.subdomain')}
              required
              disabled={!isNew}
            />
            <FormikInputField name="profile.displayName" title={t('components.nameSegment.name')} required />
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
