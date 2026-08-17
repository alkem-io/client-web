import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { CountryCombobox } from '@/crd/components/common/CountryCombobox';
import { AdminFormField } from '@/crd/forms/AdminFormField';
import { AdminFormSection } from '@/crd/forms/AdminFormSection';
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
  /**
   * Render every field, edit none, and offer no Save.
   *
   * The admin area admits several roles that may open a user record without
   * holding UPDATE on it — Platform Users Admin reads PII to service the
   * account lifecycle and cannot edit the profile (027, FR-003). The consumer
   * decides from the server's own `myPrivileges`; this only reflects it.
   */
  readOnly?: boolean;
  /** Shown above the fields when `readOnly`, to say why nothing can be edited. */
  readOnlyNotice?: string;
};

/**
 * Platform-admin user edit form — a single-submit profile editor. Mirrors the
 * MUI `UserForm` field set (identity, contact, about with markdown bio,
 * location, references). The email is read-only (changed via the change-email
 * dialog). `readOnly` renders the whole form uneditable with no Save, for a role
 * that may read the record but not update it. Pure presentation; the update
 * mutation lives in the integration page.
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
  readOnly = false,
  readOnlyNotice,
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
    !readOnly &&
    Boolean(values.firstName.trim()) &&
    Boolean(values.lastName.trim()) &&
    Boolean(values.displayName.trim());

  return (
    <form
      className="flex max-w-3xl flex-col gap-6"
      onSubmit={event => {
        event.preventDefault();
        if (canSubmit && !submitting) onSubmit();
      }}
    >
      {readOnly && readOnlyNotice ? (
        <output className="block rounded-lg border border-border bg-muted/50 p-3 text-body text-muted-foreground">
          {readOnlyNotice}
        </output>
      ) : null}

      <AdminFormSection title={t('userForm.identity')}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AdminFormField id={ids.firstName} label={t('userForm.firstName')} required={true}>
            <Input
              id={ids.firstName}
              value={values.firstName}
              onChange={e => onChange({ firstName: e.target.value })}
              disabled={submitting || readOnly}
              required={true}
            />
          </AdminFormField>
          <AdminFormField id={ids.lastName} label={t('userForm.lastName')} required={true}>
            <Input
              id={ids.lastName}
              value={values.lastName}
              onChange={e => onChange({ lastName: e.target.value })}
              disabled={submitting || readOnly}
              required={true}
            />
          </AdminFormField>
        </div>
        <AdminFormField id={ids.displayName} label={t('userForm.displayName')} required={true}>
          <Input
            id={ids.displayName}
            value={values.displayName}
            onChange={e => onChange({ displayName: e.target.value })}
            disabled={submitting || readOnly}
            required={true}
          />
        </AdminFormField>
      </AdminFormSection>

      <AdminFormSection title={t('userForm.contact')}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AdminFormField id={ids.email} label={t('userForm.email')}>
            <Input id={ids.email} value={values.email} disabled={true} readOnly={true} className="bg-muted/50" />
          </AdminFormField>
          <AdminFormField id={ids.phone} label={t('userForm.phone')}>
            <Input
              id={ids.phone}
              value={values.phone}
              onChange={e => onChange({ phone: e.target.value })}
              disabled={submitting || readOnly}
            />
          </AdminFormField>
        </div>
      </AdminFormSection>

      <AdminFormSection title={t('userForm.about')}>
        <AdminFormField id={ids.tagline} label={t('userForm.tagline')}>
          <Input
            id={ids.tagline}
            value={values.tagline}
            onChange={e => onChange({ tagline: e.target.value })}
            disabled={submitting || readOnly}
          />
        </AdminFormField>
        <div className="flex flex-col gap-1">
          <span className="text-body-emphasis">{t('userForm.bio')}</span>
          <MarkdownEditor
            value={values.bio}
            onChange={next => onChange({ bio: next })}
            disabled={submitting || readOnly}
            hideImageOptions={true}
            hideEmbedOption={true}
          />
        </div>
      </AdminFormSection>

      <AdminFormSection title={t('userForm.location')}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AdminFormField id={ids.city} label={t('userForm.city')}>
            <Input
              id={ids.city}
              value={values.city}
              onChange={e => onChange({ city: e.target.value })}
              disabled={submitting || readOnly}
            />
          </AdminFormField>
          <div className="flex flex-col gap-1">
            <span className="text-body-emphasis">{t('userForm.country')}</span>
            <CountryCombobox
              value={values.country}
              onChange={code => onChange({ country: code })}
              countries={countries}
              placeholder={t('userForm.country')}
              disabled={submitting || readOnly}
            />
          </div>
        </div>
      </AdminFormSection>

      <AdminFormSection title={t('userForm.references')}>
        <ReferencesEditor rows={values.references} onChange={onReferencesChange} disabled={submitting || readOnly} />
      </AdminFormSection>

      {errorMessage ? <p className="text-body text-destructive">{errorMessage}</p> : null}

      <div className="flex justify-end gap-2">
        {/* Never disabled by `readOnly` — it is the only way off the page. */}
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          {readOnly ? t('userForm.back') : t('userForm.cancel')}
        </Button>
        {readOnly ? null : (
          <Button type="submit" disabled={!canSubmit || submitting} aria-busy={submitting}>
            {t('userForm.save')}
          </Button>
        )}
      </div>
    </form>
  );
}
