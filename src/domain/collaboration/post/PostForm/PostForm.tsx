import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Formik, FormikConfig } from 'formik';
import { Grid } from '@mui/material';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { TagsetSegment, tagsetSegmentSchema } from '../../../platform/admin/components/Common/TagsetSegment';
import { SectionSpacer } from '../../../shared/components/Section/Section';
import FormikEffectFactory from '../../../../core/ui/forms/FormikEffect';
import { PostCreationType } from '../PostCreationDialog/PostCreationDialog';
import { Post, Tagset, TagsetType } from '../../../../core/apollo/generated/graphql-schema';
import ReferenceSegment, { referenceSegmentSchema } from '../../../platform/admin/components/Common/ReferenceSegment';
import { PushFunc, RemoveFunc } from '../../../common/reference/useEditReference';
import { Reference } from '../../../common/profile/Profile';
import MarkdownInput from '../../../platform/admin/components/Common/MarkdownInput';
import FormRow from '../../../../core/ui/forms/FormRow';
import { displayNameValidator } from '../../../../core/ui/forms/validator';
import { VERY_LONG_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';

interface FormValue {
  name: string;
  description: string;
  tagsets: Tagset[];
  postNames: string[];
  type: string;
  references: Reference[];
}

const FormikEffect = FormikEffectFactory<FormValue>();

type PostEditFields = Partial<Pick<Post, 'profile'>> & { references?: Reference[] } & {
  id?: string;
};
export type PostFormOutput = {
  displayName: string;
  description: string;
  tags: string[];
  type: string;
} & PostEditFields;
export type PostFormInput = PostCreationType & PostEditFields;
export interface PostFormProps {
  post?: PostFormInput;
  postNames?: string[];
  edit?: boolean;
  descriptionTemplate?: string;
  tags: string[] | undefined;
  loading?: boolean;
  onChange?: (post: PostFormOutput) => void;
  onStatusChanged?: (isValid: boolean) => void;
  onAddReference?: (push: PushFunc, referencesLength: number) => void;
  onRemoveReference?: (ref: Reference, remove: RemoveFunc) => void;
  children?: FormikConfig<FormValue>['children'];
}

const PostForm: FC<PostFormProps> = ({
  post,
  postNames,
  descriptionTemplate,
  tags,
  edit = false,
  loading,
  onChange,
  onStatusChanged,
  onAddReference,
  onRemoveReference,
  children,
}) => {
  const { t } = useTranslation();

  const tagsets: Tagset[] = [
    {
      id: '-1',
      name: 'default',
      tags: tags ?? [],
      allowedValues: [],
      type: TagsetType.Freeform,
    },
  ];

  const getDescriptionValue = () => {
    if (!post) {
      return '';
    }
    return post.profileData?.description ?? descriptionTemplate ?? '';
  };

  const initialValues: FormValue = useMemo(
    () => ({
      name: post?.profileData?.displayName ?? '',
      description: getDescriptionValue(),
      tagsets,
      postNames: postNames ?? [],
      type: post?.type ?? '',
      references: post?.references ?? [],
    }),
    [post?.id]
  );

  const uniqueNameValidator = yup
    .string()
    .required(t('common.field-required'))
    .test('is-valid-name', t('components.post-creation.info-step.unique-name-validation-text'), value => {
      if (edit) {
        return Boolean(value && (!postNames?.includes(value) || value === post?.profileData?.displayName));
      } else {
        return Boolean(value && !postNames?.includes(value));
      }
    });

  const validationSchema = yup.object().shape({
    name: displayNameValidator.concat(uniqueNameValidator),
    description: MarkdownValidator(VERY_LONG_TEXT_LENGTH).required(),
    tagsets: tagsetSegmentSchema,
    references: referenceSegmentSchema,
  });

  const handleChange = (values: FormValue) => {
    const post: PostFormOutput = {
      displayName: values.name,
      description: values.description,
      tags: values.tagsets[0].tags,
      type: values.type,
      references: values.references,
    };

    onChange?.(post);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      validateOnMount
      onSubmit={() => {}}
    >
      {formikState => (
        <>
          <Grid container spacing={2}>
            <FormikEffect onChange={handleChange} onStatusChange={onStatusChanged} />
            <FormRow>
              <FormikInputField
                name={'name'}
                title={t('common.title')}
                required
                placeholder={t('components.post-creation.info-step.name-help-text')}
              />
            </FormRow>
            <SectionSpacer />
            <MarkdownInput
              name="description"
              label={t('components.post-creation.info-step.description')}
              placeholder={t('components.post-creation.info-step.description-placeholder')}
              required
              loading={loading}
              rows={7}
              maxLength={VERY_LONG_TEXT_LENGTH}
              withCounter
            />
            <SectionSpacer />
            <TagsetSegment
              tagsets={tagsets}
              title={t('common.tags')}
              helpText={t('components.post-creation.info-step.tags-help-text')}
              loading={loading}
            />
            {edit && (
              <>
                <SectionSpacer />
                <ReferenceSegment
                  references={formikState.values.references}
                  onAdd={push => onAddReference?.(push, formikState.values.references?.length)}
                  onRemove={onRemoveReference}
                />
              </>
            )}
          </Grid>
          {typeof children === 'function' ? (children as Function)(formikState) : children}
        </>
      )}
    </Formik>
  );
};

export default PostForm;
