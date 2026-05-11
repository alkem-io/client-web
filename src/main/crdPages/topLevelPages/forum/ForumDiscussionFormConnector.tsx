import { Formik, useFormikContext } from 'formik';
import { Tag } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  refetchPlatformDiscussionQuery,
  refetchPlatformDiscussionsQuery,
  useCreateDiscussionMutation,
  useUpdateDiscussionMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { ForumDiscussionCategory } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { MARKDOWN_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { TagsInput } from '@/crd/forms/tags-input';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';

export type ForumDiscussionFormMode = 'initiate' | 'update';

type ForumDiscussionFormValues = {
  title: string;
  category: ForumDiscussionCategory | '';
  description: string;
  tags: string[];
};

/**
 * State surface the form pushes to its parent (the dialog). The parent uses
 * `submitForm` to drive the footer button, and renders the button in its
 * busy / disabled state based on `submitDisabled` / `busy`.
 */
export type ForumDiscussionFormState = {
  submitForm: () => void;
  submitDisabled: boolean;
  busy: boolean;
};

type ForumDiscussionFormInitiateProps = {
  mode: 'initiate';
  forumId: string;
  availableCategories: ForumDiscussionCategory[];
  /** Receives the latest submitForm callable + submit-disabled / busy flags
   *  whenever they change. The parent dialog stores this in local state and
   *  uses it to render its footer button. */
  onStateChange: (state: ForumDiscussionFormState) => void;
  /** Called after the mutation resolves successfully. The parent uses this to
   *  close the dialog; navigation to the new discussion is handled here so
   *  consumers don't need to know the new URL. */
  onCompleted: () => void;
};

type ForumDiscussionFormUpdateProps = {
  mode: 'update';
  discussion: {
    id: string;
    title: string;
    description: string;
    category: ForumDiscussionCategory;
    tags?: string[];
  };
  availableCategories: ForumDiscussionCategory[];
  onStateChange: (state: ForumDiscussionFormState) => void;
  onCompleted: () => void;
};

export type ForumDiscussionFormConnectorProps = ForumDiscussionFormInitiateProps | ForumDiscussionFormUpdateProps;

const validationSchema = yup.object().shape({
  title: textLengthValidator({ maxLength: SMALL_TEXT_LENGTH, required: true }),
  category: yup
    .mixed<ForumDiscussionCategory>()
    .oneOf(Object.values(ForumDiscussionCategory))
    .required('forms.validations.required'),
  description: MarkdownValidator(MARKDOWN_TEXT_LENGTH, { required: true }).trim(),
  tags: yup.array().of(yup.string().required()),
});

export function ForumDiscussionFormConnector(props: ForumDiscussionFormConnectorProps) {
  const navigate = useNavigate();

  const [createDiscussion, { loading: creating }] = useCreateDiscussionMutation({
    refetchQueries: [refetchPlatformDiscussionsQuery()],
  });
  const [updateDiscussion, { loading: updating }] = useUpdateDiscussionMutation();

  const initialValues: ForumDiscussionFormValues =
    props.mode === 'update'
      ? {
          title: props.discussion.title,
          category: props.discussion.category,
          description: props.discussion.description,
          tags: props.discussion.tags ?? [],
        }
      : { title: '', category: '', description: '', tags: [] };

  const handleSubmit = async (values: ForumDiscussionFormValues): Promise<void> => {
    if (!values.category) return;
    if (props.mode === 'initiate') {
      const { data } = await createDiscussion({
        variables: {
          input: {
            forumID: props.forumId,
            profile: { displayName: values.title, description: values.description },
            category: values.category,
            tags: values.tags.length > 0 ? values.tags : undefined,
          },
        },
      });
      props.onCompleted();
      if (data?.createDiscussion?.profile.url) {
        navigate(data.createDiscussion.profile.url);
      }
      return;
    }
    await updateDiscussion({
      variables: {
        input: {
          ID: props.discussion.id,
          profileData: { displayName: values.title, description: values.description },
          category: values.category,
        },
      },
      refetchQueries: [
        refetchPlatformDiscussionsQuery(),
        refetchPlatformDiscussionQuery({ discussionId: props.discussion.id }),
      ],
    });
    props.onCompleted();
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={handleSubmit}
    >
      <ForumDiscussionFormBody
        editing={props.mode === 'update'}
        availableCategories={props.availableCategories}
        mutationBusy={creating || updating}
        onStateChange={props.onStateChange}
      />
    </Formik>
  );
}

type FormBodyProps = {
  editing: boolean;
  availableCategories: ForumDiscussionCategory[];
  mutationBusy: boolean;
  onStateChange: (state: ForumDiscussionFormState) => void;
};

function ForumDiscussionFormBody({ editing, availableCategories, mutationBusy, onStateChange }: FormBodyProps) {
  const { t } = useTranslation('crd-forum');
  const { t: tDefault } = useTranslation();
  const titleId = useId();
  const categoryId = useId();

  const { values, errors, touched, isValid, dirty, isSubmitting, setFieldValue, setFieldTouched, submitForm } =
    useFormikContext<ForumDiscussionFormValues>();

  // Keep the latest submitForm callable available without forcing the parent
  // to re-key when the function identity changes from one render to the next.
  const submitFormRef = useRef(submitForm);
  submitFormRef.current = submitForm;

  const submitDisabled = !isValid || (!editing && !dirty);
  const busy = isSubmitting || mutationBusy;

  // Push state changes up to the parent dialog whenever they change. A stable
  // submitForm proxy is exposed so the parent doesn't need to re-render on
  // every Formik tick — it can keep the same reference across the dialog's
  // lifetime.
  useEffect(() => {
    onStateChange({
      submitForm: () => {
        void submitFormRef.current();
      },
      submitDisabled,
      busy,
    });
  }, [onStateChange, submitDisabled, busy]);

  const titleError = touched.title && errors.title ? String(errors.title) : undefined;
  const descriptionError = touched.description && errors.description ? String(errors.description) : undefined;
  const categoryError = touched.category && errors.category ? String(errors.category) : undefined;

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor={titleId} className="text-body-emphasis">
          {t('dialog.fields.title')}
        </Label>
        <Input
          id={titleId}
          value={values.title}
          maxLength={SMALL_TEXT_LENGTH}
          onChange={event => setFieldValue('title', event.target.value)}
          onBlur={() => setFieldTouched('title', true)}
          aria-invalid={Boolean(titleError)}
          aria-describedby={titleError ? `${titleId}-error` : undefined}
          disabled={isSubmitting}
        />
        {titleError ? (
          <p id={`${titleId}-error`} className="text-caption text-destructive">
            {tDefault(titleError as never)}
          </p>
        ) : null}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label htmlFor={categoryId} className="text-body-emphasis">
          {t('dialog.fields.category')}
        </Label>
        <Select
          value={values.category || undefined}
          onValueChange={value => {
            void setFieldValue('category', value as ForumDiscussionCategory);
          }}
          disabled={editing || isSubmitting}
        >
          <SelectTrigger
            id={categoryId}
            aria-invalid={Boolean(categoryError)}
            aria-describedby={categoryError ? `${categoryId}-error` : undefined}
          >
            <SelectValue placeholder={t('dialog.fields.category')} />
          </SelectTrigger>
          <SelectContent>
            {availableCategories.map(category => (
              <SelectItem key={category} value={category}>
                {tDefault(`common.enums.discussion-category.${category}` as never)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {categoryError ? (
          <p id={`${categoryId}-error`} className="text-caption text-destructive">
            {tDefault(categoryError as never)}
          </p>
        ) : null}
      </div>

      {/* Tags. The Label intentionally omits `htmlFor` — TagsInput is a custom
          composite whose focusable child is an inner `<input>` we can't address
          from here without widening the primitive's API. The visible Label still
          conveys association sighted-side; the inner input already carries
          `aria-label={placeholder}` for screen readers. */}
      <div className="space-y-1.5">
        <Label className="text-body-emphasis">{t('dialog.fields.tags')}</Label>
        <TagsInput
          value={values.tags}
          onChange={next => setFieldValue('tags', next)}
          placeholder={t('dialog.fields.tagsPlaceholder')}
          icon={<Tag aria-hidden="true" className="size-4 text-muted-foreground" />}
        />
      </div>

      {/* Body / description. Same reasoning as Tags above — MarkdownEditor's
          focusable target is a Tiptap contenteditable inside a Suspense
          boundary, addressed via `placeholder`-as-ariaLabel internally. */}
      <div className="space-y-1.5">
        <Label className="text-body-emphasis">{t('dialog.fields.body')}</Label>
        <MarkdownEditor
          value={values.description}
          onChange={next => setFieldValue('description', next)}
          maxLength={MARKDOWN_TEXT_LENGTH}
          disabled={isSubmitting}
          placeholder={t('dialog.fields.body')}
        />
        {descriptionError ? (
          <p className="text-caption text-destructive">{tDefault(descriptionError as never)}</p>
        ) : null}
      </div>
    </div>
  );
}
