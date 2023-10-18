import { Box } from '@mui/material';
import { Formik } from 'formik';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import FormikAutocomplete from '../../../../../../core/ui/forms/FormikAutocomplete';
import { Reference, Tagset, TagsetType } from '../../../../../../core/apollo/generated/graphql-schema';
import SaveButton from '../../../../../../core/ui/actions/SaveButton';
import { MARKDOWN_TEXT_LENGTH } from '../../../../../../core/ui/forms/field-length.constants';
import FormikMarkdownField from '../../../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { BlockSectionTitle } from '../../../../../../core/ui/typography';
import ContextReferenceSegment from '../../../components/Common/ContextReferenceSegment';
import { NameSegment, nameSegmentSchema } from '../../../components/Common/NameSegment';
import { referenceSegmentSchema } from '../../../components/Common/ReferenceSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../../../components/Common/TagsetSegment';
import Gutters from '../../../../../../core/ui/grid/Gutters';
import MarkdownValidator from '../../../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import { DEFAULT_TAGSET } from '../../../../../common/tags/tagset.constants';

export interface InnovationPackFormValues {
  nameID: string;
  profile: {
    displayName: string;
    description: string;
    tagsets: Pick<Tagset, 'id' | 'tags' | 'name' | 'allowedValues' | 'type'>[];
    references: Pick<Reference, 'id' | 'name' | 'description' | 'uri'>[];
  };
  providerId: string;
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
  providerId?: string;

  organizations?: { id: string; name: string }[];

  loading?: boolean;
  onSubmit: (formData: InnovationPackFormValues) => void;
}

const InnovationPackForm: FC<InnovationPackFormProps> = ({
  isNew = false,
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
      tagsets: [
        profile?.tagset ?? { id: '', name: DEFAULT_TAGSET, tags: [], allowedValues: [], type: TagsetType.Freeform },
      ],
      references: profile?.references ?? [],
    },
    providerId: providerId ?? '',
  };

  const validationSchema = yup.object().shape({
    nameID: nameSegmentSchema.fields?.nameID ?? yup.string(),
    profile: yup.object().shape({
      displayName: nameSegmentSchema.fields?.name ?? yup.string(),
      description: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
      references: referenceSegmentSchema,
      tagsets: tagsetSegmentSchema,
    }),
    providerId: yup.string().required(),
  });

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={onSubmit}>
      {({ values: { profile }, handleSubmit }) => {
        return (
          <Gutters disablePadding>
            <NameSegment disabled={!isNew} required={isNew} nameFieldName="profile.displayName" />
            <FormikAutocomplete
              title={t('pages.admin.innovation-packs.fields.provider')}
              name="providerId"
              values={organizations ?? []}
              required
              placeholder={t('pages.admin.innovation-packs.fields.provider')}
            />
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
