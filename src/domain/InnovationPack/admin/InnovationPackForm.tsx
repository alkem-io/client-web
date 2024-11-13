import { Box, TextField } from '@mui/material';
import { Formik } from 'formik';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Reference, SearchVisibility, Tagset, TagsetType } from '@core/apollo/generated/graphql-schema';
import SaveButton from '@core/ui/actions/SaveButton';
import { MARKDOWN_TEXT_LENGTH } from '@core/ui/forms/field-length.constants';
import FormikMarkdownField from '@core/ui/forms/MarkdownInput/FormikMarkdownField';
import { BlockSectionTitle } from '@core/ui/typography';
import ContextReferenceSegment from '../../platform/admin/components/Common/ContextReferenceSegment';
import { NameSegment, nameSegmentSchema } from '../../platform/admin/components/Common/NameSegment';
import { referenceSegmentSchema } from '../../platform/admin/components/Common/ReferenceSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '../../platform/admin/components/Common/TagsetSegment';
import Gutters from '@core/ui/grid/Gutters';
import MarkdownValidator from '@core/ui/forms/MarkdownInput/MarkdownValidator';
import { DEFAULT_TAGSET } from '../../common/tags/tagset.constants';
import FormikCheckboxField from '@core/ui/forms/FormikCheckboxField';
import FormikSelect from '@core/ui/forms/FormikSelect';

export interface InnovationPackFormValues {
  nameID: string;
  profile: {
    displayName: string;
    description: string;
    tagsets: Pick<Tagset, 'id' | 'tags' | 'name' | 'allowedValues' | 'type'>[];
    references: Pick<Reference, 'id' | 'name' | 'description' | 'uri'>[];
  };
  listedInStore: boolean;
  searchVisibility: SearchVisibility;
}

interface InnovationPackFormProps {
  isNew?: boolean;
  nameID?: string;
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
}

const InnovationPackForm: FC<InnovationPackFormProps> = ({
  isNew = false,
  nameID,
  profile,
  listedInStore,
  searchVisibility,
  provider,
  loading,
  onSubmit,
}) => {
  const { t } = useTranslation();

  const profileId = profile?.id ?? '';

  const initialValues: InnovationPackFormValues = {
    nameID: nameID ?? '',
    profile: {
      displayName: profile?.displayName ?? '',
      description: profile?.description ?? '',
      tagsets: [
        profile?.tagset ?? { id: '', name: DEFAULT_TAGSET, tags: [], allowedValues: [], type: TagsetType.Freeform },
      ],
      references: profile?.references ?? [],
    },
    listedInStore: listedInStore ?? false,
    searchVisibility: searchVisibility ?? SearchVisibility.Hidden,
  };

  const validationSchema = yup.object().shape({
    nameID: nameSegmentSchema.fields?.nameID ?? yup.string(),
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
      {({ values: { profile }, handleSubmit }) => {
        return (
          <Gutters disablePadding>
            <NameSegment disabled={!isNew} required={isNew} nameFieldName="profile.displayName" />
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
            <Box display="flex" marginY={4} justifyContent="flex-end">
              <SaveButton loading={loading} onClick={() => handleSubmit()} />
            </Box>
          </Gutters>
        );
      }}
    </Formik>
  );
};

export default InnovationPackForm;
