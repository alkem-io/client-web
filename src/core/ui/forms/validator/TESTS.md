# Validator Test Suite

Comprehensive unit tests for all form validators in the `/src/core/ui/forms/validator` directory.

## Test Files Created

### 1. `textLengthValidator.test.ts`

Tests the core text length validator with various options.

**Coverage:**

- ✅ Basic functionality (valid text, empty values)
- ✅ Required validation
- ✅ MinLength validation
- ✅ MaxLength validation
- ✅ AllowOnlySpaces validation
- ✅ Combined validations
- ✅ Default options
- ✅ Edge cases (unicode, special characters, newlines)

**Test Count:** ~25 tests

### 2. `emailValidator.test.ts`

Tests email address validation with format and length constraints.

**Coverage:**

- ✅ Basic functionality (valid emails)
- ✅ Email format validation (invalid formats)
- ✅ Required validation
- ✅ MaxLength validation (default: SMALL_TEXT_LENGTH)
- ✅ Combined validations
- ✅ Default options
- ✅ Edge cases (subdomains, special chars, numbers, hyphens)

**Test Count:** ~20 tests

### 3. `urlValidator.test.ts`

Tests URL validation with format and length constraints.

**Coverage:**

- ✅ Basic functionality (valid URLs)
- ✅ URL format validation (protocols, paths, query params, fragments, ports)
- ✅ Required validation
- ✅ MaxLength validation (default: MID_TEXT_LENGTH)
- ✅ Combined validations
- ✅ Default options
- ✅ Edge cases (international domains, IP addresses, localhost, authentication, encoding)

**Test Count:** ~25 tests

### 4. `displayNameValidator.test.ts`

Tests display name validation (built on textLengthValidator).

**Coverage:**

- ✅ Basic functionality
- ✅ MinLength validation (3 characters)
- ✅ MaxLength validation (SMALL_TEXT_LENGTH = 128)
- ✅ AllowOnlySpaces validation (false)
- ✅ Required flag support (new: validator now accepts `{ required: true }` option)
- ✅ Edge cases (special chars, numbers, unicode, emojis)
- ✅ Validation errors

**Test Count:** ~20 tests (increased from ~15 after adding required flag scenarios)

### 5. `nameValidator.test.ts`

Tests name validation (built on textLengthValidator).

**Coverage:**

- ✅ Basic functionality
- ✅ MinLength validation (1 character)
- ✅ MaxLength validation (SMALL_TEXT_LENGTH = 128)
- ✅ AllowOnlySpaces validation (false)
- ✅ Edge cases (single chars, special chars, numbers, unicode)

**Test Count:** ~15 tests

### 6. `nameIdValidator.test.ts`

Tests nameId validation with strict alphanumeric-hyphen format.

**Coverage:**

- ✅ Basic functionality
- ✅ Format validation (lowercase, numbers, hyphens only)
- ✅ MinLength validation (3 characters)
- ✅ MaxLength validation (NAMEID_MAX_LENGTH = 25)
- ✅ Edge cases (consecutive hyphens, leading/trailing hyphens)
- ✅ Validation errors

**Test Count:** ~25 tests

### 7. `subdomainValidator.test.ts`

Tests subdomain validation (same rules as nameIdValidator).

**Coverage:**

- ✅ Basic functionality
- ✅ Format validation (inherits nameIdValidator rules)
- ✅ Length validation (3-25 characters)
- ✅ Edge cases
- ✅ Consistency with nameIdValidator

**Test Count:** ~15 tests

### 8. `nonReservedNameIdValidator.test.ts`

Tests nameId validation that also excludes reserved route paths.

**Coverage:**

- ✅ Basic functionality
- ✅ Reserved path validation (admin, user, organization, etc.)
- ✅ Innovation-related paths
- ✅ Legacy paths
- ✅ Inherits nameIdValidator rules
- ✅ Edge cases (similar but non-reserved, case-sensitive)
- ✅ Validation errors

**Test Count:** ~20 tests

## Running the Tests

```bash
# Run all validator tests
pnpm test -- validator

# Run specific validator test
pnpm test -- textLengthValidator.test.ts

# Run with coverage
pnpm test -- --coverage validator
```

## Test Framework

- **Framework:** Vitest
- **Validation Library:** Yup
- **Test Style:** Describe/Test blocks with async/await

## Coverage Summary

**Total Test Files:** 8
**Total Tests:** ~165 tests
**Validators Covered:** 8/8 (100%)

### Validators Tested:

1. ✅ textLengthValidator
2. ✅ emailValidator
3. ✅ urlValidator
4. ✅ displayNameValidator
5. ✅ nameValidator
6. ✅ nameIdValidator
7. ✅ subdomainValidator
8. ✅ nonReservedNameIdValidator

## Test Patterns

### Standard Test Structure

```typescript
describe('validatorName', () => {
  describe('feature area', () => {
    test('specific behavior', async () => {
      const validator = createValidator(options);
      await expect(validator.validate(value)).resolves.toBe(expected);
    });
  });
});
```

### Common Assertions

- `resolves.toBe()` - Valid values pass
- `rejects.toThrow()` - Invalid values fail
- `resolves.toBeUndefined()` - Undefined handling
- `expect.fail()` - Explicit error expectation

## Benefits

✅ **Comprehensive Coverage** - All validators thoroughly tested
✅ **Edge Case Handling** - Unicode, special characters, empty values
✅ **Regression Prevention** - Catch breaking changes early
✅ **Documentation** - Tests serve as usage examples
✅ **Confidence** - Safe refactoring with test safety net
