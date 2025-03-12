import { Post, Tagset, TagsetType } from '@/core/apollo/generated/graphql-schema';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { LONG_MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import Gutters from '@/core/ui/grid/Gutters';
import { Reference } from '@/domain/common/profile/Profile';
import { PushFunc, RemoveFunc } from '@/domain/common/reference/useEditReference';
import { DEFAULT_TAGSET } from '@/domain/common/tags/tagset.constants';
import ReferenceSegment, { referenceSegmentSchema } from '@/domain/platform/admin/components/Common/ReferenceSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platform/admin/components/Common/TagsetSegment';
import { Formik, FormikConfig } from 'formik';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PostCreationType } from '../PostCreationDialog/PostCreationDialog';

type FormValue = {
  name: string;
  description: string;
  tagsets: Tagset[];
  postNames: string[];
  references: Reference[];
};

const FormikEffect = FormikEffectFactory<FormValue>();

type PostEditFields = Partial<Pick<Post, 'profile'>> & { references?: Reference[] } & {
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
  disableRichMedia?: boolean;
}

const PostForm = ({
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
  disableRichMedia,
}: PostFormProps) => {
  const { t } = useTranslation();

  const tagsets: Tagset[] = [
    {
      id: '-1',
      name: DEFAULT_TAGSET,
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
      references: post?.references ?? [],
    }),
    [post?.id]
  );

  const validationSchema = yup.object().shape({
    name: displayNameValidator,
    description: MarkdownValidator(LONG_MARKDOWN_TEXT_LENGTH).required(),
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
      enableReinitialize
      validateOnMount
      onSubmit={() => {}}
    >
      {formikState => (
        <>
          <Gutters disablePadding>
            <FormikEffect onChange={handleChange} onStatusChange={onStatusChanged} />
            <FormikInputField
              name={'name'}
              title={t('common.title')}
              required
              placeholder={t('components.post-creation.info-step.name-help-text')}
            />
            <FormikMarkdownField
              name="description"
              title={t('components.post-creation.info-step.description')}
              placeholder={t('components.post-creation.info-step.description-placeholder')}
              rows={7}
              required
              maxLength={LONG_MARKDOWN_TEXT_LENGTH}
              loading={loading}
              hideImageOptions={disableRichMedia}
            />
            <TagsetSegment
              tagsets={tagsets}
              title={t('common.tags')}
              helpText={t('components.post-creation.info-step.tags-help-text')}
              loading={loading}
            />
            {edit && (
              <>
                <ReferenceSegment
                  references={formikState.values.references}
                  onAdd={push => onAddReference?.(push, formikState.values.references?.length)}
                  onRemove={onRemoveReference}
                />
              </>
            )}
          </Gutters>
          {typeof children === 'function' ? (children as Function)(formikState) : children}
        </>
      )}
    </Formik>
  );
};

export default PostForm;
