import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { CountryCombobox } from '@/crd/components/common/CountryCombobox';
import { AdminFormField } from '@/crd/forms/AdminFormField';
import { AdminFormSection } from '@/crd/forms/AdminFormSection';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { type ReferenceRow, ReferencesEditor } from '@/crd/forms/references/ReferencesEditor';
import { isValidEmailOrEmpty, isValidUrlOrEmpty } from '@/crd/lib/validators';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';

export type OrgFormValues = {
  nameID: string;
  displayName: string;
  contactEmail: string;
  domain: string;
  legalEntityName: string;
  website: string;
  tagline: string;
  description: string;
  city: string;
  country: string;
  references: ReferenceRow[];
};

export type OrgCountryOption = { code: string; name: string };

type OrganizationFormProps = {
  mode: 'create' | 'edit';
  values: OrgFormValues;
  onChange: (patch: Partial<OrgFormValues>) => void;
  onReferencesChange: (rows: ReferenceRow[]) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting?: boolean;
  errorMessage?: string;
  countries: ReadonlyArray<OrgCountryOption>;
};

/**
 * Platform-admin organization create/edit form — a single-submit form (unlike
 * the per-section org settings tab). Mirrors the MUI `OrganizationForm` field
 * set: identity (alias + display name), about (tagline + markdown description),
 * location (edit only), contact & legal, and references. Pure presentation;
 * the create/update mutations live in the integration page.
 */
export function OrganizationForm({
  mode,
  values,
  onChange,
  onReferencesChange,
  onSubmit,
  onCancel,
  submitting = false,
  errorMessage,
  countries,
}: OrganizationFormProps) {
  const { t } = useTranslation('crd-admin');
  const ids = {
    nameID: useId(),
    displayName: useId(),
    tagline: useId(),
    contactEmail: useId(),
    domain: useId(),
    legalEntityName: useId(),
    website: useId(),
    city: useId(),
    country: useId(),
  };

  const emailValid = isValidEmailOrEmpty(values.contactEmail);
  const websiteValid = isValidUrlOrEmpty(values.website);
  const nameIdValid = mode === 'edit' || Boolean(values.nameID.trim());
  const canSubmit = Boolean(values.displayName.trim()) && nameIdValid && emailValid && websiteValid;

  return (
    <form
      className="flex max-w-3xl flex-col gap-6"
      onSubmit={event => {
        event.preventDefault();
        if (canSubmit) onSubmit();
      }}
    >
      <AdminFormSection title={t('orgForm.identity')}>
        <AdminFormField id={ids.nameID} label={t('orgForm.nameID')} required={mode === 'create'}>
          <Input
            id={ids.nameID}
            value={values.nameID}
            onChange={e => onChange({ nameID: e.target.value })}
            disabled={submitting || mode === 'edit'}
            readOnly={mode === 'edit'}
            className={mode === 'edit' ? 'bg-muted/50 font-mono' : 'font-mono'}
            required={mode === 'create'}
          />
        </AdminFormField>
        <AdminFormField id={ids.displayName} label={t('orgForm.displayName')} required={true}>
          <Input
            id={ids.displayName}
            value={values.displayName}
            onChange={e => onChange({ displayName: e.target.value })}
            disabled={submitting}
            required={true}
          />
        </AdminFormField>
        <AdminFormField id={ids.tagline} label={t('orgForm.tagline')}>
          <Input
            id={ids.tagline}
            value={values.tagline}
            onChange={e => onChange({ tagline: e.target.value })}
            disabled={submitting}
          />
        </AdminFormField>
      </AdminFormSection>

      <AdminFormSection title={t('orgForm.about')}>
        <div className="flex flex-col gap-1">
          <span className="text-body-emphasis">{t('orgForm.description')}</span>
          <MarkdownEditor
            value={values.description}
            onChange={next => onChange({ description: next })}
            hideImageOptions={true}
            hideEmbedOption={true}
          />
        </div>
      </AdminFormSection>

      {mode === 'edit' && (
        <AdminFormSection title={t('orgForm.location')}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AdminFormField id={ids.city} label={t('orgForm.city')}>
              <Input
                id={ids.city}
                value={values.city}
                onChange={e => onChange({ city: e.target.value })}
                disabled={submitting}
              />
            </AdminFormField>
            <div className="flex flex-col gap-1">
              <span className="text-body-emphasis">{t('orgForm.country')}</span>
              <CountryCombobox
                value={values.country}
                onChange={code => onChange({ country: code })}
                countries={countries}
                placeholder={t('orgForm.country')}
              />
            </div>
          </div>
        </AdminFormSection>
      )}

      <AdminFormSection title={t('orgForm.contactLegal')}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AdminFormField
            id={ids.contactEmail}
            label={t('orgForm.contactEmail')}
            error={emailValid ? undefined : t('orgForm.invalidEmail')}
          >
            <Input
              id={ids.contactEmail}
              type="email"
              value={values.contactEmail}
              onChange={e => onChange({ contactEmail: e.target.value })}
              disabled={submitting}
              aria-invalid={!emailValid}
            />
          </AdminFormField>
          <AdminFormField id={ids.domain} label={t('orgForm.domain')}>
            <Input
              id={ids.domain}
              value={values.domain}
              onChange={e => onChange({ domain: e.target.value })}
              disabled={submitting}
            />
          </AdminFormField>
          <AdminFormField id={ids.legalEntityName} label={t('orgForm.legalEntityName')}>
            <Input
              id={ids.legalEntityName}
              value={values.legalEntityName}
              onChange={e => onChange({ legalEntityName: e.target.value })}
              disabled={submitting}
            />
          </AdminFormField>
          <AdminFormField
            id={ids.website}
            label={t('orgForm.website')}
            error={websiteValid ? undefined : t('orgForm.invalidUrl')}
          >
            <Input
              id={ids.website}
              value={values.website}
              onChange={e => onChange({ website: e.target.value })}
              disabled={submitting}
              aria-invalid={!websiteValid}
            />
          </AdminFormField>
        </div>
      </AdminFormSection>

      <AdminFormSection title={t('orgForm.references')}>
        <ReferencesEditor rows={values.references} onChange={onReferencesChange} />
      </AdminFormSection>

      {errorMessage ? <p className="text-body text-destructive">{errorMessage}</p> : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          {t('orgForm.cancel')}
        </Button>
        <Button type="submit" disabled={!canSubmit || submitting} aria-busy={submitting}>
          {mode === 'create' ? t('orgForm.create') : t('orgForm.save')}
        </Button>
      </div>
    </form>
  );
}
