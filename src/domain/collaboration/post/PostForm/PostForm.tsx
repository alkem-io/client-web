import { Formik, type FormikConfig } from 'formik';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import type { Post } from '@/core/apollo/generated/graphql-schema';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { LONG_MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownFieldLazy';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import Gutters from '@/core/ui/grid/Gutters';
import type { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import type { PushFunc, RemoveFunc } from '@/domain/common/reference/useEditReference';
import { EmptyTagset, type TagsetModel } from '@/domain/common/tagset/TagsetModel';
import ReferenceSegment, { referenceSegmentSchema } from '@/domain/platformAdmin/components/Common/ReferenceSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platformAdmin/components/Common/TagsetSegment';
import type { PostCreationType } from '../PostCreationDialog/PostCreationDialog';

type FormValue = {
  name: string;
  description: string;
  tagsets: TagsetModel[];
  references: ReferenceModel[];
};

const FormikEffect = FormikEffectFactory<FormValue>();

type PostEditFields = Partial<Pick<Post, 'profile'>> & { references?: ReferenceModel[] } & {
  id?: string;
};
export type PostFormOutput = {
  displayName: string;
  description: string;
  tags: string[];
} & PostEditFields;
export type PostFormInput = PostCreationType & PostEditFields;
export interface PostFormProps {
  post?: PostFormInput;
  edit?: boolean;
  defaultDisplayName?: string;
  descriptionTemplate?: string;
  loading?: boolean;
  onChange?: (post: PostFormOutput) => void;
  onStatusChanged?: (isValid: boolean) => void;
  canSave?: (canSave: boolean) => void;
  onAddReference?: (push: PushFunc, referencesLength: number) => void;
  onRemoveReference?: (ref: ReferenceModel, remove: RemoveFunc) => void;
  children?: FormikConfig<FormValue>['children'];
  disableRichMedia?: boolean;
}

const PostForm = ({
  post,
  defaultDisplayName,
  descriptionTemplate,
  edit = false,
  loading,
  onChange,
  onStatusChanged,
  canSave,
  onAddReference,
  onRemoveReference,
  children,
  disableRichMedia,
}: PostFormProps) => {
  const { t } = useTranslation();

  const initialValues: FormValue = useMemo(() => {
    const tagsets: TagsetModel[] = [{ ...EmptyTagset, tags: post?.tags ?? post?.profileData?.tags ?? [] }];
    return {
      name: post?.profileData?.displayName ?? defaultDisplayName ?? '',
      description: post?.profileData?.description ?? descriptionTemplate ?? '',
      tagsets,
      references: post?.references ?? [],
    };
  }, [post]);

  const validationSchema = yup.object().shape({
    name: displayNameValidator({ required: true }),
    description: MarkdownValidator(LONG_MARKDOWN_TEXT_LENGTH, { required: true }),
    tagsets: tagsetsSegmentSchema,
    references: referenceSegmentSchema,
  });

  const handleChange = (values: FormValue) => {
    const post: PostFormOutput = {
      displayName: values.name,
      description: values.description,
      tags: values.tagsets[0].tags,
      references: values.references,
    };

    onChange?.(post);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      validateOnMount={true}
      onSubmit={() => {}}
    >
      {formikState => (
        <>
          <Gutters disablePadding={true}>
            <FormikEffect onChange={handleChange} onStatusChange={onStatusChanged} canSave={canSave} />
            <FormikInputField
              name={'name'}
              title={t('common.title')}
              required={true}
              placeholder={t('components.post-creation.info-step.name-help-text')}
            />
            <FormikMarkdownField
              name="description"
              title={t('components.post-creation.info-step.description')}
              placeholder={t('components.post-creation.info-step.description-placeholder')}
              rows={7}
              required={true}
              maxLength={LONG_MARKDOWN_TEXT_LENGTH}
              loading={loading}
              hideImageOptions={disableRichMedia}
            />
            <TagsetSegment
              title={t('common.tags')}
              helpText={t('components.post-creation.info-step.tags-help-text')}
              loading={loading}
            />
            {edit && (
              <ReferenceSegment
                references={formikState.values.references}
                onAdd={push => onAddReference?.(push, formikState.values.references?.length)}
                onRemove={onRemoveReference}
              />
            )}
          </Gutters>
          {typeof children === 'function' ? (children as Function)(formikState) : children}
        </>
      )}
    </Formik>
  );
};

export default PostForm;
