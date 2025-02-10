import { Box, FormGroup } from '@mui/material';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Tagset, TagsetType, Visual, VisualType } from '@/core/apollo/generated/graphql-schema';
import { NameSegment, nameSegmentSchema } from '@/domain/platform/admin/components/Common/NameSegment';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MID_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { BlockSectionTitle } from '@/core/ui/typography';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platform/admin/components/Common/TagsetSegment';
import SaveButton from '@/core/ui/actions/SaveButton';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { nameIdValidator } from '@/core/ui/forms/validator';
import VisualUpload from '@/core/ui/upload/VisualUpload/VisualUpload';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import Gutters from '@/core/ui/grid/Gutters';

export interface InnovationHubFormValues {
  nameID: string;
  subdomain: string;
  profile: {
    displayName: string;
    description: string;
    tagline: string;
    tagsets: Pick<Tagset, 'id' | 'tags' | 'name' | 'allowedValues' | 'type'>[];
  };
}

type InnovationHubFormProps = {
  isNew?: boolean;
  nameID?: string;
  subdomain?: string;
  profile?: {
    id?: string;
    displayName?: string;
    description?: string;
    tagline?: string;
    tagset?: { id: string; name: string; tags: string[]; allowedValues: string[]; type: TagsetType };
    visual?: Visual;
  };

  loading?: boolean;
  onSubmit: (formData: InnovationHubFormValues) => void;
};

const InnovationHubForm = ({
  isNew = false,
  nameID,
  subdomain,
  profile,
  loading,
  onSubmit,
}: InnovationHubFormProps) => {
  const { t } = useTranslation();

  const profileId = profile?.id ?? '';
  const banner = profile?.visual;

  const initialValues: InnovationHubFormValues = {
    nameID: nameID ?? '',
    subdomain: subdomain ?? '',
    profile: {
      displayName: profile?.displayName ?? '',
      description: profile?.description ?? '',
      tagline: profile?.tagline ?? '',
      tagsets: [profile?.tagset ?? { id: '', name: 'Tags', tags: [], allowedValues: [], type: TagsetType.Freeform }],
    },
  };

  const validationSchema = yup.object().shape({
    nameID: nameIdValidator,
    subdomain: nameIdValidator,
    profile: yup.object().shape({
      displayName: nameSegmentSchema.fields?.name ?? yup.string(),
      description: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
      tagline: yup.string().max(MID_TEXT_LENGTH),
      tagsets: tagsetsSegmentSchema,
    }),
  });

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={onSubmit}>
      {({ values: { profile }, errors, handleSubmit }) => {
        return (
          <Gutters disablePadding>
            <FormikInputField
              name="subdomain"
              title={t('pages.admin.innovationHubs.fields.subdomain')}
              required
              disabled={!isNew}
            />
            <NameSegment disabled={!isNew} required={isNew} nameFieldName="profile.displayName" />
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
                <TagsetSegment fieldName="profile.tagsets" tagsets={profile.tagsets} />
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
