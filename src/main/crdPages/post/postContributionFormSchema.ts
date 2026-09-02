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
  name: string;
  uri: string;
  description?: string;
};

export const postContributionFormSchema = object({
  displayName: displayNameValidator({ required: true }),
  description: MarkdownValidator(LONG_MARKDOWN_TEXT_LENGTH, { required: true }),
  tags: array(string().defined()).default([]),
  references: array(
    object({
      id: string().notRequired(),
      name: string().defined(),
      uri: string().defined(),
      description: string().notRequired(),
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
