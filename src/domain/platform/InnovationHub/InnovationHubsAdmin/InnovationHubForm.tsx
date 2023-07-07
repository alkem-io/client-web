import { Box, FormGroup } from '@mui/material';
import { Formik } from 'formik';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Tagset, TagsetType, Visual } from '../../../../core/apollo/generated/graphql-schema';
import { NameSegment, nameSegmentSchema } from '../../admin/components/Common/NameSegment';
import FormikAutocomplete from '../../../../common/components/composite/forms/FormikAutocomplete';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MID_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import { TagsetSegment, tagsetSegmentSchema } from '../../admin/components/Common/TagsetSegment';
import SaveButton from '../../../../core/ui/actions/SaveButton';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { nameIdValidator } from '../../../../common/utils/validator';
import VisualUpload from '../../../../core/ui/upload/VisualUpload/VisualUpload';

export interface InnovationHubFormValues {
  nameID: string;
  subdomain: string;
  profile: {
    displayName: string;
    description: string;
    tagline: string;
    tagsets: Pick<Tagset, 'id' | 'tags' | 'name' | 'allowedValues' | 'type'>[];
  };
  hostId: string;
}

interface InnovationHubFormProps {
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
  hostId?: string;

  organizations?: { id: string; name: string }[];

  loading?: boolean;
  onSubmit: (formData: InnovationHubFormValues) => void;
}

const InnovationHubForm: FC<InnovationHubFormProps> = ({
  isNew = false,
  nameID,
  subdomain,
  profile,
  hostId,
  organizations,
  loading,
  onSubmit,
}) => {
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
    hostId: hostId ?? '',
  };

  const validationSchema = yup.object().shape({
    nameID: nameIdValidator,
    subdomain: nameIdValidator,
    profile: yup.object().shape({
      displayName: nameSegmentSchema.fields?.name ?? yup.string(),
      description: yup.string().required().max(MID_TEXT_LENGTH),
      tagline: yup.string().max(MID_TEXT_LENGTH),
      tagsets: tagsetSegmentSchema,
    }),
    // hostId: yup.string().required(), // TODO: Add provider
  });

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={onSubmit}>
      {({ values: { profile }, handleSubmit }) => {
        return (
          <PageContentBlock>
            <FormikInputField
              name="subdomain"
              title={t('pages.admin.innovationHubs.fields.subdomain')}
              required
              disabled={!isNew}
            />
            <NameSegment disabled={!isNew} required={isNew} nameFieldName="profile.displayName" />
            <FormGroup>
              <FormikAutocomplete
                title={t('pages.admin.innovationHubs.fields.host')}
                name="hostId"
                values={organizations ?? []}
                /* required */
                disabled
                placeholder={t('pages.admin.innovationHubs.fields.host')}
              />
            </FormGroup>
            <FormikInputField name="profile.tagline" title={t('components.profile.fields.tagline.title')} />
            <FormGroup>
              <FormikMarkdownField
                title={t('common.description')}
                name="profile.description"
                maxLength={MID_TEXT_LENGTH}
                withCounter
              />
            </FormGroup>
            {!isNew && profileId ? (
              <>
                <BlockSectionTitle>{t('components.tagsSegment.title')}</BlockSectionTitle>
                <TagsetSegment fieldName="profile.tagsets" tagsets={profile.tagsets} />
                <BlockSectionTitle>{t('components.visualSegment.banner')}</BlockSectionTitle>
                <VisualUpload
                  visual={banner}
                  altText={t('pages.visual-edit.banner.description', {
                    alternativeText: banner?.alternativeText,
                    interpolation: {
                      escapeValue: false,
                    },
                  })}
                />
              </>
            ) : (
              <BlockSectionTitle>{t('pages.admin.innovationHubs.saveForMoreDetails')}</BlockSectionTitle>
            )}
            <FormGroup>
              <Box display="flex" marginY={4} justifyContent="flex-end">
                <SaveButton loading={loading} onClick={() => handleSubmit()} />
              </Box>
            </FormGroup>
          </PageContentBlock>
        );
      }}
    </Formik>
  );
};

export default InnovationHubForm;
