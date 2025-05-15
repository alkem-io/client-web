import * as yup from 'yup';
import { ContributorSelectorType, SelectedContributor } from './FormikContributorsSelectorField.models';
import { compact } from 'lodash';

export const DUPLICATE_EMAIL_ERROR = 'Duplicate email address';

const SelectedContributorSchema = yup.object().shape({
  type: yup
    .mixed<ContributorSelectorType>()
    .oneOf([ContributorSelectorType.User, ContributorSelectorType.Email])
    .required(),
  id: yup.string().when(['type'], ([type], schema) => {
    return type === ContributorSelectorType.User ? schema.required() : schema.notRequired();
  }),
  email: yup.string().when(['type'], ([type], schema) => {
    return type === ContributorSelectorType.Email ? schema.email().required() : schema.notRequired();
  }),
});

export const SelectedContributorsArraySchema = yup.array().of(
  SelectedContributorSchema.test('unique-emails', DUPLICATE_EMAIL_ERROR, function (value) {
    if (!value || !value.email) return true;
    const email = value.email.toLowerCase();
    const emails = compact(
      this.parent.map(
        (item: SelectedContributor) => item.type === ContributorSelectorType.Email && item.email.toLowerCase()
      )
    );
    const firstIndex = emails.indexOf(email);
    const lastIndex = emails.lastIndexOf(email);
    if (firstIndex !== lastIndex) {
      return this.createError({
        path: `${this.path}.email`,
        message: DUPLICATE_EMAIL_ERROR,
      });
    }
    return true;
  })
);
