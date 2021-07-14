import { Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Context, Reference, Tagset, Visual } from '../../types/graphql-schema';
import ContextReferenceSegment from '../Admin/Common/ContextReferenceSegment';
import { contextSegmentSchema, ContextSegment } from '../Admin/Common/ContextSegment';
import { ProfileSegment, profileSegmentSchema } from '../Admin/Common/ProfileSegment';
import { referenceSegmentSchema } from '../Admin/Common/ReferenceSegment';
import { tagsetSegmentSchema, TagsetSegment } from '../Admin/Common/TagsetSegment';
import { visualSegmentSchema, VisualSegment } from '../Admin/Common/VisualSegment';
import Divider from '../core/Divider';
import Typography from '../core/Typography';

export interface ProfileFormValuesType {
  name: string;
  nameID: string;
  background: string;
  impact: string;
  tagline: string;
  vision: string;
  who: string;
  references: Reference[];
  visual: Pick<Visual, 'avatar' | 'background' | 'banner'>;
  tagsets: Tagset[];
}

interface Props {
  context?: Context;
  name?: string;
  nameID?: string;
  tagset?: Tagset;
  onSubmit: (formData: ProfileFormValuesType) => void;
  wireSubmit: (setter: () => void) => void;
  contextOnly?: boolean;
  isEdit: boolean;
}

const ProfileForm: FC<Props> = ({
  context,
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

  const initialValues: ProfileFormValuesType = {
    name: name || '',
    nameID: nameID || '',
    background: context?.background || '',
    impact: context?.impact || '',
    tagline: context?.tagline || '',
    vision: context?.vision || '',
    who: context?.who || '',
    references: context?.references || [],
    visual: {
      avatar: context?.visual?.avatar || '',
      background: context?.visual?.background || '',
      banner: context?.visual?.banner || '',
    },
    tagsets: tagsets,
  };

  const validationSchema = yup.object().shape({
    name: contextOnly ? yup.string() : profileSegmentSchema.fields?.name || yup.string(),
    nameID: contextOnly ? yup.string() : profileSegmentSchema.fields?.nameID || yup.string(),
    background: contextSegmentSchema.fields?.background || yup.string(),
    impact: contextSegmentSchema.fields?.impact || yup.string(),
    tagline: contextSegmentSchema.fields?.tagline || yup.string(),
    vision: contextSegmentSchema.fields?.vision || yup.string(),
    who: contextSegmentSchema.fields?.who || yup.string(),
    references: referenceSegmentSchema,
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
      {({ values: { references }, handleSubmit }) => {
        // TODO [ATS]: Research useImperativeHandle and useRef to achieve this.
        if (!isSubmitWired) {
          wireSubmit(handleSubmit);
          isSubmitWired = true;
        }

        return (
          <>
            {!contextOnly && <ProfileSegment disabled={isEdit} required={!isEdit} />}
            <ContextSegment />

            {!contextOnly && (
              <>
                <Form.Group>
                  <Typography variant={'h4'} color={'primary'}>
                    {t('components.tagsSegment.title')}
                  </Typography>
                </Form.Group>
                <TagsetSegment tagsets={tagsets} />
              </>
            )}

            <Form.Group>
              <Typography variant={'h4'} color={'primary'}>
                {t('components.visualSegment.title')}
              </Typography>
            </Form.Group>

            <VisualSegment />

            <ContextReferenceSegment references={references || []} contextId={context?.id} />
            <Divider />
          </>
        );
      }}
    </Formik>
  );
};

export default ProfileForm;
