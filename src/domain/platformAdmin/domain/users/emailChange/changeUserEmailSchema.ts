import * as yup from 'yup';
import { MID_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { emailValidator } from '@/core/ui/forms/validator/emailValidator';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';

export const REASON_MAX_LENGTH = MID_TEXT_LENGTH;
export const APPROVER_FIELD_MAX_LENGTH = SMALL_TEXT_LENGTH;

export type ChangeUserEmailFormValues = {
  newEmail: string;
  confirmEmail: string;
  reason: string;
  approver: {
    name: string;
    role: string;
    organization: string;
  };
};

export const changeUserEmailInitialValues: ChangeUserEmailFormValues = {
  newEmail: '',
  confirmEmail: '',
  reason: '',
  approver: {
    name: '',
    role: '',
    organization: '',
  },
};

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

export const changeUserEmailSchema = (currentEmail: string) =>
  yup.object().shape({
    newEmail: emailValidator({ required: true }).test(
      'email-changed',
      TranslatedValidatedMessageWithPayload('pages.admin.users.emailChange.validation.unchanged'),
      value => !value || normalizeEmail(value) !== normalizeEmail(currentEmail)
    ),
    confirmEmail: yup
      .string()
      .required(TranslatedValidatedMessageWithPayload('forms.validations.required'))
      .test(
        'emails-match',
        TranslatedValidatedMessageWithPayload('pages.admin.users.emailChange.validation.mismatch'),
        (value, context) => value === context.parent.newEmail
      ),
    reason: textLengthValidator({ maxLength: REASON_MAX_LENGTH, required: true }),
    approver: yup.object().shape({
      name: textLengthValidator({ maxLength: APPROVER_FIELD_MAX_LENGTH, required: true }),
      role: textLengthValidator({ maxLength: APPROVER_FIELD_MAX_LENGTH, required: true }),
      organization: textLengthValidator({ maxLength: APPROVER_FIELD_MAX_LENGTH }),
    }),
  });
