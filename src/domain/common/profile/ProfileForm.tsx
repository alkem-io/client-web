import { Formik } from 'formik';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Profile, Reference, SpaceLevel, Tagset, TagsetType } from '@/core/apollo/generated/graphql-schema';
import ContextReferenceSegment from '@/domain/platform/admin/components/Common/ContextReferenceSegment';
import { contextSegmentSchema } from '@/domain/platform/admin/components/Common/ContextSegment';
import { NameSegment, nameSegmentSchema } from '@/domain/platform/admin/components/Common/NameSegment';
import { referenceSegmentSchema } from '@/domain/platform/admin/components/Common/ReferenceSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platform/admin/components/Common/TagsetSegment';
import { LocationSegment } from '../location/LocationSegment';
import { EmptyLocation, Location } from '../location/Location';
import { formatLocation } from '../location/LocationUtils';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { BlockSectionTitle } from '@/core/ui/typography';
import Gutters from '@/core/ui/grid/Gutters';
import { DEFAULT_TAGSET } from '../tags/tagset.constants';

export interface ProfileFormValues {
  name: string;
  nameID: string;
  tagline: string;
  location: Partial<Location>;
  references: Reference[];
  tagsets: Tagset[];
}

type ProfileFormProps = {
  profile?: Omit<Profile, 'storageBucket' | 'url'>;
  name?: string;
  nameID?: string;
  tagset?: Tagset;
  onSubmit: (formData: ProfileFormValues) => void;
  wireSubmit: (setter: () => void) => void;
  contextOnly?: boolean;
  isEdit: boolean;
};

const ProfileForm = ({
  profile,
  name,
  nameID,
  tagset,
  onSubmit,
  wireSubmit,
  isEdit,
  contextOnly = false,
}: ProfileFormProps) => {
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

  const initialValues: ProfileFormValues = {
    name: name || '',
    nameID: nameID || '',
    tagline: profile?.tagline || '',
    location: formatLocation(profile?.location) || EmptyLocation,
    references: profile?.references || [],
    tagsets,
  };

  const validationSchema = yup.object().shape({
    name: contextOnly ? yup.string() : nameSegmentSchema.fields?.name || yup.string(),
    nameID: contextOnly ? yup.string() : nameSegmentSchema.fields?.nameID || yup.string(),
    tagline: contextSegmentSchema.fields?.tagline || yup.string(),
    references: referenceSegmentSchema,
    tagsets: tagsetsSegmentSchema,
  });

  let isSubmitWired = false;

  // TODO: why is this needed on a profile?
  const spaceLevel = SpaceLevel.L0;

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
        // TODO [ATS]: Research useImperativeHandle and useRef to achieve this.
        if (!isSubmitWired) {
          wireSubmit(handleSubmit);
          isSubmitWired = true;
        }

        return (
          <Gutters>
            <NameSegment disabled={isEdit} required={!isEdit} />
            <LocationSegment
              disabled={!isEdit}
              cols={2}
              cityFieldName="location.city"
              countryFieldName="location.country"
            />
            <FormikInputField
              name={'tagline'}
              title={t(`context.${spaceLevel}.tagline.title` as const)}
              rows={3}
              maxLength={SMALL_TEXT_LENGTH}
            />
            <BlockSectionTitle color={'primary'}>{t('common.tags')}</BlockSectionTitle>
            <TagsetSegment tagsets={tagsets} />
            <ContextReferenceSegment references={references || []} profileId={profile?.id} />
          </Gutters>
        );
      }}
    </Formik>
  );
};

export default ProfileForm;
