import { Box, TextField } from '@mui/material';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  Reference,
  SearchVisibility,
  Tagset,
  TagsetReservedName,
  TagsetType,
} from '@/core/apollo/generated/graphql-schema';
import SaveButton from '@/core/ui/actions/SaveButton';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { BlockSectionTitle } from '@/core/ui/typography';
import ContextReferenceSegment from '@/domain/platform/admin/components/Common/ContextReferenceSegment';
import { nameSegmentSchema } from '@/domain/platform/admin/components/Common/NameSegment';
import { referenceSegmentSchema } from '@/domain/platform/admin/components/Common/ReferenceSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platform/admin/components/Common/TagsetSegment';
import Gutters from '@/core/ui/grid/Gutters';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import FormikCheckboxField from '@/core/ui/forms/FormikCheckboxField';
import FormikSelect from '@/core/ui/forms/FormikSelect';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';

export interface InnovationPackFormValues {
  profile: {
    displayName: string;
    description: string;
    tagsets: Pick<Tagset, 'id' | 'tags' | 'name' | 'allowedValues' | 'type'>[];
    references: Pick<Reference, 'id' | 'name' | 'description' | 'uri'>[];
  };
  listedInStore: boolean;
  searchVisibility: SearchVisibility;
}

type InnovationPackFormProps = {
  isNew?: boolean;
  profile?: {
    id?: string;
    displayName?: string;
    description?: string;
    tagset?: { id: string; name: string; tags: string[]; allowedValues: string[]; type: TagsetType };
    references?: Pick<Reference, 'id' | 'name' | 'description' | 'uri'>[];
  };
  provider?: { id: string; profile: { displayName: string } };
  listedInStore?: boolean;
  searchVisibility?: SearchVisibility;
  loading?: boolean;
  onSubmit: (formData: InnovationPackFormValues) => void;
};
/**
 * Requires StorageConfigContextProvider
 */
const InnovationPackForm = ({
  isNew = false,
  profile,
  listedInStore,
  searchVisibility,
  provider,
  loading,
  onSubmit,
}: InnovationPackFormProps) => {
  const { t } = useTranslation();

  const profileId = profile?.id ?? '';

  const initialValues: InnovationPackFormValues = {
    profile: {
      displayName: profile?.displayName ?? '',
      description: profile?.description ?? '',
      tagsets: [
        profile?.tagset ?? {
          id: '',
          name: TagsetReservedName.Default,
          tags: [],
          allowedValues: [],
          type: TagsetType.Freeform,
        },
      ],
      references: profile?.references ?? [],
    },
    listedInStore: listedInStore ?? false,
    searchVisibility: searchVisibility ?? SearchVisibility.Hidden,
  };

  const validationSchema = yup.object().shape({
    profile: yup.object().shape({
      displayName: nameSegmentSchema.fields?.name ?? yup.string(),
      description: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
      references: referenceSegmentSchema,
      tagsets: tagsetsSegmentSchema,
    }),
    listedInStore: yup.boolean(),
    searchVisibility: yup.string().required(),
  });

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={onSubmit}>
      {({ values: { profile }, handleSubmit, isValid }) => {
        return (
          <Gutters disablePadding>
            <FormikInputField name="profile.displayName" title={t('components.nameSegment.name')} required />
            {!isNew && (
              <>
                <TextField
                  title={t('pages.admin.innovation-packs.fields.provider')}
                  label={t('pages.admin.innovation-packs.fields.provider')}
                  value={provider?.profile.displayName ?? ''}
                  disabled
                  placeholder={t('pages.admin.innovation-packs.fields.provider')}
                />
                <FormikCheckboxField
                  name="listedInStore"
                  title={t('pages.admin.innovation-packs.fields.listedInStore')}
                />
                <FormikSelect
                  name="searchVisibility"
                  title={t('pages.admin.innovation-packs.fields.searchVisibility')}
                  values={Object.values(SearchVisibility).map(id => ({
                    id,
                    name: t(`common.enums.searchVisibility.${id}` as const),
                  }))}
                />
              </>
            )}
            <FormikMarkdownField
              temporaryLocation={isNew}
              title={t('common.description')}
              name="profile.description"
              maxLength={MARKDOWN_TEXT_LENGTH}
            />
            {!isNew && profileId ? (
              <>
                <BlockSectionTitle>{t('common.tags')}</BlockSectionTitle>
                <TagsetSegment fieldName="profile.tagsets" tagsets={profile.tagsets} />
                <ContextReferenceSegment
                  fieldName="profile.references"
                  references={profile.references || []}
                  profileId={profileId}
                />
              </>
            ) : (
              <BlockSectionTitle>{t('pages.admin.innovation-packs.save-new-for-details')}</BlockSectionTitle>
            )}
            <Box display="flex" justifyContent="flex-end">
              <SaveButton loading={loading} onClick={() => handleSubmit()} disabled={!isValid} />
            </Box>
          </Gutters>
        );
      }}
    </Formik>
  );
};

export default InnovationPackForm;
