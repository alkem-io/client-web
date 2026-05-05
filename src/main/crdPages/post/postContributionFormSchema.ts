import { array, object, string } from 'yup';
import { LONG_MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';

export type PostContributionFormValues = {
  displayName: string;
  description: string;
  tags: string[];
  references: PostReferenceRow[];
};

export type PostReferenceRow = {
  id?: string;
  title: string;
  url: string;
  description: string;
};

export const postContributionFormSchema = object({
  displayName: displayNameValidator({ required: true }),
  description: MarkdownValidator(LONG_MARKDOWN_TEXT_LENGTH, { required: true }),
  tags: array(string().defined()).default([]),
  references: array(
    object({
      id: string().notRequired(),
      title: string().defined(),
      url: string().defined(),
      description: string().defined(),
    })
  ).default([]),
});

export const emptyPostContributionFormValues = (
  defaultDisplayName = '',
  defaultDescription = ''
): PostContributionFormValues => ({
  displayName: defaultDisplayName,
  description: defaultDescription,
  tags: [],
  references: [],
});
