import { Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Location, EmptyLocation } from '../../../common/location/Location';
import { formatLocation } from '../../../common/location/LocationUtils';
import { Context, Profile, Reference, Tagset } from '../../../../core/apollo/generated/graphql-schema';
import { contextSegmentSchema } from './Common/ContextSegment';
import { nameSegmentSchema } from './Common/NameSegment';
import { referenceSegmentSchema } from './Common/ReferenceSegment';
import { tagsetSegmentSchema } from './Common/TagsetSegment';
import { visualSegmentSchema } from './Common/VisualSegment';
import { HubContextSegment } from '../hub/HubContextSegment';

interface HubEditFormProps {
  context?: Context;
  profile?: Profile;
  name?: string;
  nameID?: string;
  hostID?: string;
  tagset?: Tagset;
  organizations?: { id: string; name: string }[];
  onSubmit: (formData: HubEditFormValuesType) => void;
  wireSubmit: (setter: () => void) => void;
  isEdit: boolean;
  loading: boolean;
}

export interface HubEditFormValuesType {
  name: string;
  nameID: string;
  host: string;
  background: string;
  impact: string;
  tagline: string;
  location: Partial<Location>;
  vision: string;
  who: string;
  references: Reference[];
  recommendations: Reference[];
  // todo: https://app.zenhub.com/workspaces/alkemio-5ecb98b262ebd9f4aec4194c/issues/alkem-io/client-web/1628
  // visual: Pick<Visual, 'avatar' | 'background' | 'banner'>;
  tagsets: Tagset[];
}

const HubEditForm: FC<HubEditFormProps> = ({
  context,
  profile,
  name,
  nameID,
  hostID,
  tagset,
  onSubmit,
  wireSubmit,
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
      },
    ] as Tagset[];
  }, [tagset]);

  const initialValues: HubEditFormValuesType = {
    name: name || '',
    nameID: nameID || '',
    background: profile?.description || '',
    impact: context?.impact || '',
    tagline: profile?.tagline || '',
    location: formatLocation(profile?.location) || EmptyLocation,
    vision: context?.vision || '',
    who: context?.who || '',
    references: profile?.references || [],
    recommendations: context?.recommendations || [],
    tagsets: tagsets,
    host: hostID || '',
    // todo: https://app.zenhub.com/workspaces/alkemio-5ecb98b262ebd9f4aec4194c/issues/alkem-io/client-web/1628
    /*visual: {
      avatar: context?.visual?.avatar || '',
      background: context?.visual?.background || '',
      banner: context?.visual?.banner || '',
    },*/
  };

  const validationSchema = yup.object().shape({
    name: nameSegmentSchema.fields?.name || yup.string(),
    nameID: nameSegmentSchema.fields?.nameID || yup.string(),
    host: yup.string().required(t('forms.validations.required')),
    background: contextSegmentSchema.fields?.background || yup.string(),
    impact: contextSegmentSchema.fields?.impact || yup.string(),
    tagline: contextSegmentSchema.fields?.tagline || yup.string(),
    vision: contextSegmentSchema.fields?.vision || yup.string(),
    who: contextSegmentSchema.fields?.who || yup.string(),
    references: referenceSegmentSchema,
    recommendations: referenceSegmentSchema,
    visual: visualSegmentSchema,
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
      {({ handleSubmit }) => {
        if (!isSubmitWired) {
          wireSubmit(handleSubmit);
          isSubmitWired = true;
        }

        return <HubContextSegment loading={loading} />;
      }}
    </Formik>
  );
};

export default HubEditForm;
