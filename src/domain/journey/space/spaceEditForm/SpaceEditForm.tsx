import { Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Context, Profile, Reference, Tagset, TagsetType } from '@/core/apollo/generated/graphql-schema';
import ContextReferenceSegment from '@/domain/platform/admin/components/Common/ContextReferenceSegment';
import { contextSegmentSchema } from '@/domain/platform/admin/components/Common/ContextSegment';
import { nameSegmentSchema } from '@/domain/platform/admin/components/Common/NameSegment';
import { referenceSegmentSchema } from '@/domain/platform/admin/components/Common/ReferenceSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platform/admin/components/Common/TagsetSegment';
import { EmptyLocation, Location } from '@/domain/common/location/Location';
import { formatLocation } from '@/domain/common/location/LocationUtils';
import { LocationSegment } from '@/domain/common/location/LocationSegment';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import FormikInputFieldField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import SaveButton from '@/core/ui/actions/SaveButton';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import { DEFAULT_TAGSET } from '@/domain/common/tags/tagset.constants';
import { Caption } from '@/core/ui/typography';

interface SpaceEditFormProps {
  context?: Omit<Context, 'anonymousReadAccess'>;
  profile?: Omit<Profile, 'storageBucket' | 'url'>;
  name?: string;
  nameID?: string;
  tagset?: Tagset;
  onSubmit: (formData: SpaceEditFormValuesType) => void;
  edit?: boolean;
  loading: boolean;
}

export interface SpaceEditFormValuesType {
  name: string;
  nameID: string;
  tagline: string;
  location: Partial<Location>;
  references: Reference[];
  tagsets: Tagset[];
}

const SpaceEditForm: FC<SpaceEditFormProps> = ({ profile, name, nameID, tagset, onSubmit, edit, loading }) => {
  const { t } = useTranslation();

  const tagsets = useMemo(() => {
    if (tagset) return [tagset];
    return [
      {
        id: '',
        name: DEFAULT_TAGSET,
        tags: [],
        allowedValues: [],
        type: TagsetType.Freeform,
      },
    ] as Tagset[];
  }, [tagset]);

  const profileId = profile?.id;

  const initialValues: SpaceEditFormValuesType = {
    name: name ?? '',
    nameID: nameID ?? '',
    tagline: profile?.tagline ?? '',
    location: formatLocation(profile?.location) || EmptyLocation,
    references: profile?.references ?? [],
    tagsets,
  };

  const validationSchema = yup.object().shape({
    name: nameSegmentSchema.fields?.name ?? yup.string(),
    nameID: nameSegmentSchema.fields?.nameID ?? yup.string(),
    tagline: contextSegmentSchema.fields?.tagline ?? yup.string(),
    references: referenceSegmentSchema,
    tagsets: tagsetsSegmentSchema,
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async values => {
        onSubmit(values);
      }}
    >
      {({ values: { references }, handleSubmit }) => {
        return (
          <>
            <PageContentBlockSeamless row disablePadding>
              <PageContentBlock>
                <PageContentBlockHeader title={t('components.editSpaceForm.about')} />
                <FormikInputFieldField name="name" title={t('components.nameSegment.name')} required />
                {!edit && (
                  <FormikInputFieldField
                    name="nameID"
                    title={t('components.nameSegment.nameID.title')}
                    placeholder={t('components.nameSegment.nameID.placeholder')}
                    required
                  />
                )}
                <FormikInputField
                  name={'tagline'}
                  title={t('context.space.tagline.title')}
                  rows={3}
                  maxLength={SMALL_TEXT_LENGTH}
                />
                <LocationSegment cols={2} cityFieldName="location.city" countryFieldName="location.country" />
                <TagsetSegment title={t('common.tags')} tagsets={tagsets} />
                <Actions justifyContent="end">
                  <SaveButton onClick={handleSubmit} loading={loading} />
                </Actions>
              </PageContentBlock>
            </PageContentBlockSeamless>
            {edit && (
              <PageContentBlock>
                <PageContentBlockHeader title={t('components.referenceSegment.title')}>
                  <Caption>{t('components.referenceSegment.description')}</Caption>
                </PageContentBlockHeader>
                <ContextReferenceSegment references={references} profileId={profileId} />
                <Actions justifyContent="end">
                  <SaveButton onClick={handleSubmit} loading={loading} />
                </Actions>
              </PageContentBlock>
            )}
          </>
        );
      }}
    </Formik>
  );
};

export default SpaceEditForm;
