import { Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  Context,
  Profile,
  Reference,
  SpaceVisibility,
  Tagset,
  TagsetType,
} from '../../../../core/apollo/generated/graphql-schema';
import ContextReferenceSegment from '../../../platform/admin/components/Common/ContextReferenceSegment';
import { contextSegmentSchema } from '../../../platform/admin/components/Common/ContextSegment';
import FormikAutocomplete from '../../../../core/ui/forms/FormikAutocomplete';
import { nameSegmentSchema } from '../../../platform/admin/components/Common/NameSegment';
import { referenceSegmentSchema } from '../../../platform/admin/components/Common/ReferenceSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../../../platform/admin/components/Common/TagsetSegment';
import { EmptyLocation, Location } from '../../../common/location/Location';
import { formatLocation } from '../../../common/location/LocationUtils';
import { LocationSegment } from '../../../common/location/LocationSegment';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import FormikInputFieldField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { SMALL_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import SaveButton from '../../../../core/ui/actions/SaveButton';
import { Actions } from '../../../../core/ui/actions/Actions';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import SpaceProfileFixedInformation, { SpaceProfileFixedInformationProps } from './SpaceProfileFixedInformation';

interface Props {
  context?: Context;
  profile?: Profile;
  name?: string;
  nameID?: string;
  hostID?: string;
  tagset?: Tagset;
  organizations?: { id: string; name: string }[];
  visibility?: SpaceVisibility;
  host?: SpaceProfileFixedInformationProps['host'];
  onSubmit: (formData: SpaceEditFormValuesType) => void;
  edit?: boolean;
  loading: boolean;
}

export interface SpaceEditFormValuesType {
  name: string;
  nameID: string;
  host: string;
  tagline: string;
  location: Partial<Location>;
  references: Reference[];
  tagsets: Tagset[];
}

const SpaceEditForm: FC<Props> = ({
  profile,
  name,
  nameID,
  hostID,
  tagset,
  visibility,
  host,
  onSubmit,
  edit,
  organizations = [],
  loading,
}) => {
  const { t } = useTranslation();

  const tagsets = useMemo(() => {
    if (tagset) return [tagset];
    return [
      {
        id: '',
        name: 'default',
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
    host: hostID ?? '',
  };

  const validationSchema = yup.object().shape({
    name: nameSegmentSchema.fields?.name ?? yup.string(),
    nameID: nameSegmentSchema.fields?.nameID ?? yup.string(),
    host: yup.string().required(t('forms.validations.required')),
    tagline: contextSegmentSchema.fields?.tagline ?? yup.string(),
    references: referenceSegmentSchema,
    tagsets: tagsetSegmentSchema,
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
              <PageContentBlock columns={edit ? 8 : 12}>
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
                {!edit && (
                  <FormikAutocomplete
                    title={t('components.editSpaceForm.host.title')}
                    name="host"
                    values={organizations}
                    required
                    placeholder={t('components.editSpaceForm.host.title')}
                    disabled={edit}
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
              {edit && <SpaceProfileFixedInformation visibility={visibility!} host={host} />}
            </PageContentBlockSeamless>
            {edit && (
              <PageContentBlock>
                <PageContentBlockHeader title={t('components.referenceSegment.title')} />
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
