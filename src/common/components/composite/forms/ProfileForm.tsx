import { Grid } from '@mui/material';
import { Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Context, Reference, Tagset } from '../../../../models/graphql-schema';
import ContextReferenceSegment from '../../../../domain/platform/admin/components/Common/ContextReferenceSegment';
import { contextSegmentSchema } from '../../../../domain/platform/admin/components/Common/ContextSegment';
import { NameSegment, nameSegmentSchema } from '../../../../domain/platform/admin/components/Common/NameSegment';
import { referenceSegmentSchema } from '../../../../domain/platform/admin/components/Common/ReferenceSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../../../../domain/platform/admin/components/Common/TagsetSegment';
import WrapperTypography from '../../core/WrapperTypography';
import InputField from '../../../../domain/platform/admin/components/Common/InputField';
import { LocationSegment } from '../../../../domain/common/location/LocationSegment';
import { EmptyLocation, Location } from '../../../../domain/common/location/Location';
import { formatLocation } from '../../../../domain/common/location/LocationUtils';
import { JourneyType } from '../../../../domain/challenge/JourneyType';

export interface ProfileFormValues {
  name: string;
  nameID: string;
  tagline: string;
  location: Partial<Location>;
  who: string;
  references: Reference[];
  tagsets: Tagset[];
}

interface Props {
  context?: Context;
  journeyType: JourneyType;
  name?: string;
  nameID?: string;
  tagset?: Tagset;
  onSubmit: (formData: ProfileFormValues) => void;
  wireSubmit: (setter: () => void) => void;
  contextOnly?: boolean;
  isEdit: boolean;
}

const ProfileForm: FC<Props> = ({
  context,
  journeyType,
  name,
  nameID,
  tagset,
  onSubmit,
  wireSubmit,
  isEdit,
  contextOnly = false,
}) => {
  const { t } = useTranslation();
  const tagsets = useMemo(() => {
    if (tagset) return [tagset];
    return [
      {
        id: '',
        name: 'default',
        tags: [],
      },
    ] as Tagset[];
  }, [tagset]);

  const initialValues: ProfileFormValues = {
    name: name || '',
    nameID: nameID || '',
    tagline: context?.tagline || '',
    location: formatLocation(context?.location) || EmptyLocation,
    who: context?.who || '',
    references: context?.references || [],
    tagsets,
  };

  const validationSchema = yup.object().shape({
    name: contextOnly ? yup.string() : nameSegmentSchema.fields?.name || yup.string(),
    nameID: contextOnly ? yup.string() : nameSegmentSchema.fields?.nameID || yup.string(),
    tagline: contextSegmentSchema.fields?.tagline || yup.string(),
    references: referenceSegmentSchema,
    tagsets: tagsetSegmentSchema,
  });

  let isSubmitWired = false;

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
          <>
            <NameSegment disabled={isEdit} required={!isEdit} />
            <LocationSegment
              disabled={!isEdit}
              cols={2}
              cityFieldName="location.city"
              countryFieldName="location.country"
            />
            <InputField
              name="tagline"
              label={t(`components.contextSegment.${journeyType}.tagline.title` as const)}
              rows={3}
            />
            <Grid item xs={12}>
              <WrapperTypography variant={'h4'} color={'primary'}>
                {t('components.tagsSegment.title')}
              </WrapperTypography>
            </Grid>
            <TagsetSegment tagsets={tagsets} />
            <ContextReferenceSegment references={references || []} contextId={context?.id} />
          </>
        );
      }}
    </Formik>
  );
};

export default ProfileForm;
