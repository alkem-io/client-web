# Contract: Form Migration (Formik+Yup → React Hook Form+Zod)

**Feature**: 003-mui-to-shadcn-migration  
**Date**: 2026-03-23  
**Scope**: How forms are migrated from Formik+Yup to React Hook Form+Zod

---

## 1. Overview

96 files use Formik, 63 files use Yup schemas. All are migrated to React Hook Form (RHF) + Zod as part of Phases 5–6 (P2 pages — settings & admin).

---

## 2. Form Component Contract (shadcn Form)

The shadcn `form.tsx` component wraps React Hook Form and provides:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/core/ui/components/form';
```

### Form Structure Contract

```tsx
// 1. Define Zod schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().max(500).optional(),
  email: z.string().email('Invalid email'),
});

// 2. Infer TypeScript type from schema
type FormValues = z.infer<typeof formSchema>;

// 3. Create form with useForm + zodResolver
const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    name: '',
    description: '',
    email: '',
  },
});

// 4. Render with shadcn Form components
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="tw-space-y-4">
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormDescription>Your display name</FormDescription>
          <FormMessage />  {/* Auto-renders Zod validation errors */}
        </FormItem>
      )}
    />
    <Button type="submit">Save</Button>
  </form>
</Form>
```

---

## 3. Migration Pattern: Formik → RHF

### Before (Formik Pattern)

```tsx
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { InputField } from '@/core/ui/forms/InputField';

const validationSchema = Yup.object({
  displayName: Yup.string().required('Required').max(255),
  tagline: Yup.string().max(100).nullable(),
});

interface FormValues {
  displayName: string;
  tagline: string | null;
}

const MyForm = ({ initialValues, onSubmit }) => (
  <Formik<FormValues>
    initialValues={initialValues}
    validationSchema={validationSchema}
    onSubmit={onSubmit}
    enableReinitialize
  >
    {({ isSubmitting, dirty, isValid }) => (
      <Form>
        <Field name="displayName" component={InputField} label="Display Name" />
        <Field name="tagline" component={InputField} label="Tagline" />
        <Button type="submit" disabled={isSubmitting || !dirty || !isValid}>
          Save
        </Button>
      </Form>
    )}
  </Formik>
);
```

### After (RHF + Zod Pattern)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/core/ui/components/form';
import { Input } from '@/core/ui/components/input';
import { Button } from '@/core/ui/components/button';

const formSchema = z.object({
  displayName: z.string().min(1, 'Required').max(255),
  tagline: z.string().max(100).nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const MyForm = ({ initialValues, onSubmit }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="tw-space-y-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tagline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tagline</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={form.formState.isSubmitting || !form.formState.isDirty || !form.formState.isValid}
        >
          Save
        </Button>
      </form>
    </Form>
  );
};
```

---

## 4. Key Behavioral Differences

| Behavior | Formik | React Hook Form |
|----------|--------|-----------------|
| Re-renders | Every keystroke (controlled) | Minimal (uncontrolled by default) |
| Form state access | `useFormikContext()` | `useFormContext()` or direct from `useForm()` |
| Field registration | `<Field name="x" />` or `useField('x')` | `register('x')` or `<Controller>` / `<FormField>` |
| Validation timing | `validateOnChange`, `validateOnBlur` | `mode: 'onChange'`, `'onBlur'`, `'onSubmit'` |
| Error access | `errors.fieldName` | `formState.errors.fieldName` |
| Dirty check | `dirty` boolean | `formState.isDirty` |
| Reset | `resetForm()` | `form.reset()` |
| Submit handler | `onSubmit` prop on `<Formik>` | `form.handleSubmit(onSubmit)` on `<form>` |
| Initial values change | `enableReinitialize` prop | `reset(newValues)` in `useEffect` |
| Array fields | `<FieldArray>` | `useFieldArray()` |
| Nested objects | Dot notation `'address.city'` | Same — dot notation supported |

---

## 5. Yup → Zod Schema Conversion Rules

### String Validations

| Yup | Zod |
|-----|-----|
| `Yup.string()` | `z.string()` |
| `.required('msg')` | `.min(1, 'msg')` |
| `.email('msg')` | `.email('msg')` |
| `.url('msg')` | `.url('msg')` |
| `.min(n, 'msg')` | `.min(n, 'msg')` |
| `.max(n, 'msg')` | `.max(n, 'msg')` |
| `.matches(regex)` | `.regex(regex)` |
| `.nullable()` | `.nullable()` |
| `.optional()` | `.optional()` |
| `.trim()` | `.trim()` |
| `.oneOf(['a','b'])` | `z.enum(['a','b'])` |

### Number Validations

| Yup | Zod |
|-----|-----|
| `Yup.number()` | `z.number()` |
| `.positive()` | `.positive()` |
| `.negative()` | `.negative()` |
| `.integer()` | `.int()` |
| `.min(n)` | `.min(n)` |
| `.max(n)` | `.max(n)` |

### Object/Array Validations

| Yup | Zod |
|-----|-----|
| `Yup.object().shape({})` | `z.object({})` |
| `Yup.array().of(schema)` | `z.array(schema)` |
| `.min(n)` on arrays | `.min(n)` |
| `.max(n)` on arrays | `.max(n)` |

### Conditional / Cross-Field Validations

| Yup | Zod |
|-----|-----|
| `.when('field', { is: val, then: schema })` | `.refine()` or `.superRefine()` on parent object |
| `Yup.ref('field')` | Access via `.refine((data) => data.field === data.otherField)` |
| `.test('name', 'msg', fn)` | `.refine(fn, 'msg')` |

---

## 6. GraphQL Integration Preservation

Forms submit data via Apollo Client mutations. The migration MUST NOT change:

- Mutation documents (GraphQL operations)
- Variable shapes passed to `mutate()`
- `onCompleted` / `onError` callback behavior
- Optimistic response patterns

The `onSubmit` handler signature remains:
```typescript
const onSubmit = async (values: FormValues) => {
  await updateProfile({
    variables: {
      input: {
        displayName: values.displayName,
        // ... map form values to GraphQL variables
      },
    },
  });
};
```

This is identical between Formik's `onSubmit` and RHF's `handleSubmit(onSubmit)`.

---

## 7. Custom Form Components

The current codebase has Formik-wrapped input components in `core/ui/forms/`:

| Current Component | Purpose | Migration |
|------------------|---------|-----------|
| `InputField` | Formik-connected text input | shadcn `Input` + RHF `FormField` |
| `MarkdownField` | Formik-connected markdown editor | Preserve TipTap; wrap with RHF `Controller` |
| `SelectField` | Formik-connected select | shadcn `Select` + RHF `FormField` |
| `SwitchField` | Formik-connected switch | shadcn `Switch` + RHF `FormField` |
| `CheckboxField` | Formik-connected checkbox | shadcn `Checkbox` + RHF `FormField` |
| `TagsField` | Formik-connected tag input | Custom component + RHF `Controller` |
| `AvatarField` | Formik-connected image upload | Custom component + RHF `Controller` |

These wrapper components are replaced with the shadcn `FormField` pattern, which uses render props rather than Formik's `component` prop.

---

## 8. Migration Order for Forms

1. **Phase 2–3**: Create shadcn `form.tsx` (RHF wrapper) in `core/ui/components/`
2. **Phase 2–3**: Install `react-hook-form`, `@hookform/resolvers`, `zod`
3. **Phases 5–6**: Migrate forms page-by-page:
   - Account Settings forms (profile, notifications, etc.)
   - Space Settings forms (profile, context, community, etc.)
   - Create Space modal form
   - Admin forms
4. Each form migration touches: Yup schema → Zod schema, Formik wrapper → RHF `useForm()`, Field components → FormField render props
5. GraphQL mutation calls remain unchanged
