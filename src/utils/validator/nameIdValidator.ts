import * as yup from 'yup';
import i18next from 'i18next';

export const nameIdValidator = yup
  .string()
  .required(i18next.t('forms.validations.required'))
  .min(3, 'NameID should be at least 3 symbols long')
  .max(25, 'Exceeded the limit of 25 characters')
  .matches(/^[a-z0-9-]*$/, 'NameID can contain only lower case latin characters, numbers and hyphens');
