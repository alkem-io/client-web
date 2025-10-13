import { Box, TextField } from '@mui/material';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { SearchVisibility } from '@/core/apollo/generated/graphql-schema';
import SaveButton from '@/core/ui/actions/SaveButton';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { BlockSectionTitle } from '@/core/ui/typography';
import ContextReferenceSegment from '@/domain/platformAdmin/components/Common/ContextReferenceSegment';
import { nameSegmentSchema } from '@/domain/platformAdmin/components/Common/NameSegment';
import { referenceSegmentSchema } from '@/domain/platformAdmin/components/Common/ReferenceSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platformAdmin/components/Common/TagsetSegment';
import Gutters from '@/core/ui/grid/Gutters';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import FormikCheckboxField from '@/core/ui/forms/FormikCheckboxField';
import FormikSelect from '@/core/ui/forms/FormikSelect';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { EmptyTagset, TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { nameOf } from '@/core/utils/nameOf';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';

export interface InnovationPackFormValues {
  profile: {
    displayName: string;
    description: string;
    tagsets: TagsetModel[];
    references: ReferenceModel[];
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
    tagset?: TagsetModel;
    references?: ReferenceModel[];
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
  const tagset = profile?.tagset ?? EmptyTagset;

  const initialValues: InnovationPackFormValues = {
    profile: {
      displayName: profile?.displayName ?? '',
      description: profile?.description ?? '',
      tagsets: [tagset],
      references: profile?.references ?? [],
    },
    listedInStore: listedInStore ?? false,
    searchVisibility: searchVisibility ?? SearchVisibility.Hidden,
  };

  const validationSchema = yup.object().shape({
    profile: yup.object().shape({
      displayName: nameSegmentSchema.fields?.displayName ?? textLengthValidator(),
      description: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
      references: referenceSegmentSchema,
      tagsets: tagsetsSegmentSchema,
    }),
    listedInStore: yup.boolean(),
    searchVisibility: textLengthValidator({ required: true }),
  });

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={onSubmit}>
      {({ values: { profile }, handleSubmit, isValid }) => {
        return (
          <Gutters disablePadding>
            <FormikInputField
              name={nameOf<InnovationPackFormValues>('profile.displayName')}
              title={t('components.nameSegment.name')}
              required
            />
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
                  name={nameOf<InnovationPackFormValues>('listedInStore')}
                  label={t('pages.admin.innovation-packs.fields.listedInStore')}
                />
                <FormikSelect
                  name={nameOf<InnovationPackFormValues>('searchVisibility')}
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
              name={nameOf<InnovationPackFormValues>('profile.description')}
              maxLength={MARKDOWN_TEXT_LENGTH}
            />
            {!isNew && profileId ? (
              <>
                <BlockSectionTitle>{t('common.tags')}</BlockSectionTitle>
                <TagsetSegment name={nameOf<InnovationPackFormValues>('profile.tagsets')} />
                <ContextReferenceSegment
                  fieldName={nameOf<InnovationPackFormValues>('profile.references')}
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
