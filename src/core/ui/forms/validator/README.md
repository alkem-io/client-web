# Form Validators

This directory contains reusable form validation utilities for consistent, human-readable validation across the application.

## Available Validators

### `textLengthValidator`

A flexible, reusable text validator that provides human-readable translated validation messages.

#### Options

```typescript
interface TextLengthValidatorOptions {
  minLength?: number; // Minimum allowed length (optional)
  maxLength?: number; // Maximum allowed length (optional)
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

#### Options

```typescript
interface UrlValidatorOptions {
  maxLength?: number; // Maximum allowed length (default: MID_TEXT_LENGTH)
  required?: boolean; // Whether the field is required (default: false)
}
```

#### Examples

```typescript
// Basic usage (optional URL)
website: urlValidator();

// With max length
website: urlValidator({ maxLength: MID_TEXT_LENGTH });

// Required URL
uri: urlValidator({ required: true });

// With both options
link: urlValidator({ maxLength: SMALL_TEXT_LENGTH, required: true });
```

### `emailValidator`

Validates email addresses and optionally enforces max length with human-readable messages.

#### Options

```typescript
interface EmailValidatorOptions {
  maxLength?: number; // Maximum allowed length (default: SMALL_TEXT_LENGTH)
  required?: boolean; // Whether the field is required (default: false)
}
```

#### Examples

```typescript
// Basic usage (optional email)
contactEmail: emailValidator();

// With max length
email: emailValidator({ maxLength: SMALL_TEXT_LENGTH });

// Required email
userEmail: emailValidator({ required: true });

// With both options
primaryEmail: emailValidator({ maxLength: MID_TEXT_LENGTH, required: true });
```

## Complete Example

```typescript
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import { urlValidator } from '@/core/ui/forms/validator/urlValidator';
import { emailValidator } from '@/core/ui/forms/validator/emailValidator';
import { SMALL_TEXT_LENGTH, MID_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import * as yup from 'yup';

export const organizationSchema = yup.object().shape({
  // Email with max length
  contactEmail: emailValidator({ maxLength: SMALL_TEXT_LENGTH }),

  // Simple text fields
  domain: textLengthValidator({ maxLength: SMALL_TEXT_LENGTH }),
  legalEntityName: textLengthValidator({ maxLength: SMALL_TEXT_LENGTH }),

  // URL with max length
  website: urlValidator({ maxLength: MID_TEXT_LENGTH }),

  // Display name with minimum and required
  displayName: textLengthValidator({
    minLength: 3,
    maxLength: SMALL_TEXT_LENGTH,
    required: true,
    allowOnlySpaces: false,
  }),
});
```

## Field Length Constants

Available from `@/core/ui/forms/field-length.constants`:

- `ALT_TEXT_LENGTH = 120` - For image alt text
- `SMALL_TEXT_LENGTH = 128` - For names, titles, short labels
- `MID_TEXT_LENGTH = 512` - For taglines, short descriptions
- `LONG_TEXT_LENGTH = 2048` - For longer descriptions, bios
- `MARKDOWN_TEXT_LENGTH = 8000` - For markdown content
- `LONG_MARKDOWN_TEXT_LENGTH = 48000` - For extended markdown content
- `COMMENTS_TEXT_LENGTH = 8000` - For comment fields

The markdown limits are measured against the raw markdown source, not the rendered
text, so formatting, links and inlined images all count. They are held deliberately
below the server ceiling they map to - for both post contribution and callout framing
descriptions that is the 65568 limit on `profile.description` - so client validation
fails before the API does. `field-length.constants.ts` carries the fuller note on which
constants mirror the server and which are client-only.

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
