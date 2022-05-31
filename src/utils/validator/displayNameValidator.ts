import * as yup from 'yup';
import i18next from 'i18next';

export const displayNameValidator = yup
  .string()
  .test('is-not-spaces', 'Name must contain characters.', value => !/^[\s]*$/.test(value || ''))
  .required(i18next.t('forms.validations.required'))
  .min(3, 'Name should be at least 3 symbols long')
  .max(128, 'Exceeded the limit of 128 characters');
