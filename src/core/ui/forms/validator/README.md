# Form Validators

This directory contains reusable form validation utilities for consistent, human-readable validation across the application.

## Available Validators

### `textLengthValidator`

A flexible, reusable text validator that provides human-readable translated validation messages.

#### Options

```typescript
interface TextLengthValidatorOptions {
  minLength?: number; // Minimum allowed length (optional)
  maxLength: number; // Maximum allowed length (required)
  required?: boolean; // Whether the field is required (default: false)
  allowOnlySpaces?: boolean; // Whether to allow strings with only spaces (default: false)
}
```

#### Examples

```typescript
// Display name (min 3, max SMALL_TEXT_LENGTH, no spaces-only)
textLengthValidator({ minLength: 3, maxLength: SMALL_TEXT_LENGTH, allowOnlySpaces: false });

// Description (max MID_TEXT_LENGTH, spaces allowed)
textLengthValidator({ maxLength: MID_TEXT_LENGTH, allowOnlySpaces: true });

// Required field
textLengthValidator({ maxLength: SMALL_TEXT_LENGTH, required: true });
```

### `urlValidator`

Validates URLs and optionally enforces max length with human-readable messages.

Can be used in two ways:

1. **As a function** with max length: `urlValidator(MID_TEXT_LENGTH)`
2. **As a chainable validator**: `urlValidator.max(...).required()`

#### Examples

```typescript
// Simple usage with human-readable max length
website: urlValidator(MID_TEXT_LENGTH);

// Backward compatible - chain with other validators
uri: urlValidator.max(512).required();

// With default max length (MID_TEXT_LENGTH)
link: urlValidator();
```

### `emailValidator`

Validates email addresses and optionally enforces max length with human-readable messages.

Can be used in two ways:

1. **As a function** with max length: `emailValidator(SMALL_TEXT_LENGTH)`
2. **As a chainable validator**: `emailValidator.required()`

#### Examples

```typescript
// Simple usage with human-readable max length
contactEmail: emailValidator(SMALL_TEXT_LENGTH);

// Backward compatible - chain with other validators
email: emailValidator.required();

// With default max length (SMALL_TEXT_LENGTH)
userEmail: emailValidator();
```

## Complete Example

```typescript
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import { urlValidator } from '@/core/ui/forms/validator/urlValidator';
import { emailValidator } from '@/core/ui/forms/validator/emailValidator';
import { SMALL_TEXT_LENGTH, MID_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';

export const organizationSchema = yup.object().shape({
  // Email with max length
  contactEmail: emailValidator(SMALL_TEXT_LENGTH),

  // Simple text fields
  domain: textLengthValidator({ maxLength: SMALL_TEXT_LENGTH }),
  legalEntityName: textLengthValidator({ maxLength: SMALL_TEXT_LENGTH }),

  // URL with max length
  website: urlValidator(MID_TEXT_LENGTH),

  // Display name with minimum
  displayName: textLengthValidator({
    minLength: 3,
    maxLength: SMALL_TEXT_LENGTH,
    allowOnlySpaces: false,
  }).required(),
});
```

## Field Length Constants

Available from `@/core/ui/forms/field-length.constants`:

- `ALT_TEXT_LENGTH = 120` - For image alt text
- `SMALL_TEXT_LENGTH = 128` - For names, titles, short labels
- `MID_TEXT_LENGTH = 512` - For taglines, short descriptions
- `LONG_TEXT_LENGTH = 2048` - For longer descriptions, bios
- `MARKDOWN_TEXT_LENGTH = 8000` - For markdown content
- `LONG_MARKDOWN_TEXT_LENGTH = 16000` - For extended markdown content
- `COMMENTS_TEXT_LENGTH = 8000` - For comment fields

## Benefits

✅ **Consistent validation** across the application
✅ **Human-readable error messages** using translation keys
✅ **Reusable and maintainable** - change validation logic in one place
✅ **Type-safe** with TypeScript
✅ **Flexible** - configure for different use cases
✅ **Chainable** - works with yup's `.required()` and other methods

## Migration Guide

### Before (manual validation)

```typescript
import * as yup from 'yup';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import { SMALL_TEXT_LENGTH } from '../field-length.constants';

const validator = yup
  .string()
  .test(
    'is-not-spaces',
    TranslatedValidatedMessageWithPayload('forms.validations.nonBlank'),
    value => !value || !/^[\s]*$/.test(value)
  )
  .min(3, ({ min }) => TranslatedValidatedMessageWithPayload('forms.validations.minLength')({ min }))
  .max(SMALL_TEXT_LENGTH, ({ max }) => TranslatedValidatedMessageWithPayload('forms.validations.maxLength')({ max }));
```

### After (using textLengthValidator)

```typescript
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import { SMALL_TEXT_LENGTH } from '../field-length.constants';

const validator = textLengthValidator({
  minLength: 3,
  maxLength: SMALL_TEXT_LENGTH,
  allowOnlySpaces: false,
});
```

Much cleaner and more maintainable! 🎉
