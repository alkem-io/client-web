import { Box, Grid } from '@mui/material';
import { Formik } from 'formik';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import FormikAutocomplete from '../../../../../../common/components/composite/forms/FormikAutocomplete';
import { Reference, Tagset } from '../../../../../../core/apollo/generated/graphql-schema';
import SaveButton from '../../../../../../core/ui/actions/SaveButton';
import { MID_TEXT_LENGTH } from '../../../../../../core/ui/forms/field-length.constants';
import FormikMarkdownField from '../../../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { BlockSectionTitle } from '../../../../../../core/ui/typography';
import FormRow from '../../../../../../common/components/FormLayout/FormRow';
import ContextReferenceSegment from '../../../components/Common/ContextReferenceSegment';
import { NameSegment, nameSegmentSchema } from '../../../components/Common/NameSegment';
import { referenceSegmentSchema } from '../../../components/Common/ReferenceSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../../../components/Common/TagsetSegment';

export interface InnovationPackFormValues {
  nameID: string;
  profile: {
    displayName: string;
    description: string;
    tagsets: Pick<Tagset, 'id' | 'tags' | 'name'>[];
    references: Pick<Reference, 'id' | 'name' | 'description' | 'uri'>[];
  };
  providerId: string;
}

interface InnovationPackFormProps {
  isNew: boolean;
  nameID?: string;
  profile?: {
    id?: string;
    displayName?: string;
    description?: string;
    tagset?: { id: string; name: string; tags: string[] };
    references?: Pick<Reference, 'id' | 'name' | 'description' | 'uri'>[];
  };
  providerId?: string;

  organizations?: { id: string; name: string }[];

  loading?: boolean;
  onSubmit: (formData: InnovationPackFormValues) => void;
}

const InnovationPackForm: FC<InnovationPackFormProps> = ({
  isNew,
  nameID,
  profile,
  providerId,
  organizations,
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
      tagsets: [profile?.tagset ?? { id: '', name: 'Tags', tags: [] }],
      references: profile?.references ?? [],
    },
    providerId: providerId ?? '',
  };

  const validationSchema = yup.object().shape({
    nameID: nameSegmentSchema.fields?.nameID ?? yup.string(),
    profile: yup.object().shape({
      displayName: nameSegmentSchema.fields?.name ?? yup.string(),
      description: yup.string().required().max(MID_TEXT_LENGTH),
      references: referenceSegmentSchema,
      tagsets: tagsetSegmentSchema,
    }),
    providerId: yup.string().required(),
  });

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={onSubmit}>
      {({ values: { profile }, handleSubmit }) => {
        return (
          <Grid container gap={2}>
            <NameSegment disabled={!isNew} required={isNew} nameFieldName="profile.displayName" />
            <FormRow>
              <FormikAutocomplete
                title={t('pages.admin.innovation-packs.fields.provider')}
                name="providerId"
                values={organizations ?? []}
                required
                placeholder={t('pages.admin.innovation-packs.fields.provider')}
              />
            </FormRow>
            <FormRow>
              <FormikMarkdownField
                title={t('common.description')}
                name="profile.description"
                maxLength={MID_TEXT_LENGTH}
                withCounter
              />
            </FormRow>
            {!isNew && profileId ? (
              <>
                <BlockSectionTitle>{t('components.tagsSegment.title')}</BlockSectionTitle>
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
            <FormRow>
              <Box display="flex" marginY={4} justifyContent="flex-end">
                <SaveButton loading={loading} onClick={() => handleSubmit()} />
              </Box>
            </FormRow>
          </Grid>
        );
      }}
    </Formik>
  );
};

export default InnovationPackForm;
