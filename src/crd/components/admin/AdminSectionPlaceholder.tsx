import { useTranslation } from 'react-i18next';

/**
 * Placeholder body for admin sections not yet migrated to CRD. Rendered inside
 * the `AdminShell` so the section navigation works end-to-end before each
 * section is filled in.
 */
export function AdminSectionPlaceholder() {
  const { t } = useTranslation('crd-admin');

  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
      <h2 className="text-subheader font-semibold">{t('placeholder.title')}</h2>
      <p className="text-body text-muted-foreground max-w-md">{t('placeholder.description')}</p>
    </div>
  );
}
