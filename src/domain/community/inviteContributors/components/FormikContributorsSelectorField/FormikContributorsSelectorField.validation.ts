import * as yup from 'yup';
import { ContributorSelectorType } from './FormikContributorsSelectorField.models';

export const SelectedContributorSchema = yup.object().shape({
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
