import { type ReactNode, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { CountryCombobox } from '@/crd/components/common/CountryCombobox';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { type ReferenceRow, ReferencesEditor } from '@/crd/forms/references/ReferencesEditor';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';

export type UserFormValues = {
  firstName: string;
  lastName: string;
  displayName: string;
  /** Read-only here — changed via the dedicated change-email dialog. */
  email: string;
  phone: string;
  tagline: string;
  bio: string;
  city: string;
  country: string;
  references: ReferenceRow[];
};

export type UserCountryOption = { code: string; name: string };

type UserEditFormProps = {
  values: UserFormValues;
  onChange: (patch: Partial<UserFormValues>) => void;
  onReferencesChange: (rows: ReferenceRow[]) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting?: boolean;
  errorMessage?: string;
  countries: ReadonlyArray<UserCountryOption>;
};

/**
 * Platform-admin user edit form — a single-submit profile editor. Mirrors the
 * MUI `UserForm` field set (identity, contact, about with markdown bio,
 * location, references). The email is read-only (changed via the change-email
 * dialog). Pure presentation; the update mutation lives in the integration page.
 */
export function UserEditForm({
  values,
  onChange,
  onReferencesChange,
  onSubmit,
  onCancel,
  submitting = false,
  errorMessage,
  countries,
}: UserEditFormProps) {
  const { t } = useTranslation('crd-admin');
  const ids = {
    firstName: useId(),
    lastName: useId(),
    displayName: useId(),
    email: useId(),
    phone: useId(),
    tagline: useId(),
    city: useId(),
    country: useId(),
  };

  const canSubmit =
    Boolean(values.firstName.trim()) && Boolean(values.lastName.trim()) && Boolean(values.displayName.trim());

  return (
    <form
      className="flex max-w-3xl flex-col gap-6"
      onSubmit={event => {
        event.preventDefault();
        if (canSubmit) onSubmit();
      }}
    >
      <Section title={t('userForm.identity')}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field id={ids.firstName} label={t('userForm.firstName')} required={true}>
            <Input
              id={ids.firstName}
              value={values.firstName}
              onChange={e => onChange({ firstName: e.target.value })}
              disabled={submitting}
              required={true}
            />
          </Field>
          <Field id={ids.lastName} label={t('userForm.lastName')} required={true}>
            <Input
              id={ids.lastName}
              value={values.lastName}
              onChange={e => onChange({ lastName: e.target.value })}
              disabled={submitting}
              required={true}
            />
          </Field>
        </div>
        <Field id={ids.displayName} label={t('userForm.displayName')} required={true}>
          <Input
            id={ids.displayName}
            value={values.displayName}
            onChange={e => onChange({ displayName: e.target.value })}
            disabled={submitting}
            required={true}
          />
        </Field>
      </Section>

      <Section title={t('userForm.contact')}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field id={ids.email} label={t('userForm.email')}>
            <Input id={ids.email} value={values.email} disabled={true} readOnly={true} className="bg-muted/50" />
          </Field>
          <Field id={ids.phone} label={t('userForm.phone')}>
            <Input
              id={ids.phone}
              value={values.phone}
              onChange={e => onChange({ phone: e.target.value })}
              disabled={submitting}
            />
          </Field>
        </div>
      </Section>

      <Section title={t('userForm.about')}>
        <Field id={ids.tagline} label={t('userForm.tagline')}>
          <Input
            id={ids.tagline}
            value={values.tagline}
            onChange={e => onChange({ tagline: e.target.value })}
            disabled={submitting}
          />
        </Field>
        <div className="flex flex-col gap-1">
          <span className="text-body-emphasis">{t('userForm.bio')}</span>
          <MarkdownEditor
            value={values.bio}
            onChange={next => onChange({ bio: next })}
            hideImageOptions={true}
            hideEmbedOption={true}
          />
        </div>
      </Section>

      <Section title={t('userForm.location')}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field id={ids.city} label={t('userForm.city')}>
            <Input
              id={ids.city}
              value={values.city}
              onChange={e => onChange({ city: e.target.value })}
              disabled={submitting}
            />
          </Field>
          <div className="flex flex-col gap-1">
            <span className="text-body-emphasis">{t('userForm.country')}</span>
            <CountryCombobox
              value={values.country}
              onChange={code => onChange({ country: code })}
              countries={countries}
              placeholder={t('userForm.country')}
            />
          </div>
        </div>
      </Section>

      <Section title={t('userForm.references')}>
        <ReferencesEditor rows={values.references} onChange={onReferencesChange} />
      </Section>

      {errorMessage ? <p className="text-body text-destructive">{errorMessage}</p> : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          {t('userForm.cancel')}
        </Button>
        <Button type="submit" disabled={!canSubmit || submitting} aria-busy={submitting}>
          {t('userForm.save')}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <h2 className="text-section-title">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  id,
  label,
  required = false,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-body-emphasis">
        <label htmlFor={id}>{label}</label>
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            {' *'}
          </span>
        ) : null}
      </span>
      {children}
    </div>
  );
}
