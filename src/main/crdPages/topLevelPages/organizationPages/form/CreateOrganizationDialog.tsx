import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateOrganizationMutation } from '@/core/apollo/generated/apollo-hooks';
import clearCacheForQuery from '@/core/apollo/utils/clearCacheForQuery';
import useNavigate from '@/core/routing/useNavigate';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { OrganizationForm } from '@/crd/components/admin/organizations/OrganizationForm';
import { useDialogCloseGuard } from '@/crd/components/dialogs/useDialogCloseGuard';
import type { ReferenceRow } from '@/crd/forms/references/ReferencesEditor';
import { toRoutePath } from '@/crd/lib/toRoutePath';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { COUNTRIES } from '@/domain/common/location/countries.constants';
import { EMPTY_ORG_FORM, toCreateInput } from './orgFormMapper';

type CreateOrganizationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Create-organization dialog. Opened from any surface whose trigger is already
 * gated on the `CreateOrganization` platform privilege (the user-settings
 * Organizations tab), so it needs no route and no client-side guard — the server
 * still enforces the privilege on the mutation. Reuses the shared
 * `OrganizationForm` + `orgFormMapper`; a successful create lands on the new
 * organization's profile, and a discard guard confirms before losing input.
 */
const CreateOrganizationDialog = ({ open, onOpenChange }: CreateOrganizationDialogProps) => {
  const { t } = useTranslation('crd-admin');
  const navigate = useNavigate();
  const notify = useNotification();

  const [values, setValues] = useState(EMPTY_ORG_FORM);
  // Start each open from a clean slate.
  useEffect(() => {
    if (open) setValues(EMPTY_ORG_FORM);
  }, [open]);

  const isDirty = JSON.stringify(values) !== JSON.stringify(EMPTY_ORG_FORM);

  const [createOrg, { loading: submitting }] = useCreateOrganizationMutation({
    update: cache => clearCacheForQuery(cache, 'organizationsPaginated'),
  });

  const { handleOpenChange, requestClose, guardElement } = useDialogCloseGuard({
    isDirty,
    onClose: () => onOpenChange(false),
    blockClose: submitting,
  });

  const handleSubmit = () => {
    // Navigate/notify only on success; the global Apollo error handler surfaces
    // failures. The empty catch keeps a rejected mutation from becoming an
    // unhandled promise rejection.
    void createOrg({ variables: { input: toCreateInput(values) } })
      .then(({ data: created }) => {
        notify(t('orgForm.created'), 'success');
        onOpenChange(false);
        // Land on the organization that was just created. `profile.url` is a full
        // URL server-side, so it has to go through `toRoutePath` before
        // react-router sees it.
        const createdUrl = created?.createOrganization.profile?.url;
        if (createdUrl) {
          navigate(toRoutePath(createdUrl));
        }
      })
      .catch(() => undefined);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          aria-describedby={undefined}
          className="flex max-h-[90vh] flex-col overflow-hidden p-0 gap-0 sm:max-w-3xl"
        >
          <DialogHeader className="border-b px-6 pt-6 pb-4 pr-12">
            <DialogTitle>{t('orgForm.createTitle')}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <OrganizationForm
              mode="create"
              values={values}
              onChange={patch => setValues(prev => ({ ...prev, ...patch }))}
              onReferencesChange={(rows: ReferenceRow[]) => setValues(prev => ({ ...prev, references: rows }))}
              onSubmit={handleSubmit}
              onCancel={requestClose}
              submitting={submitting}
              countries={COUNTRIES}
            />
          </div>
        </DialogContent>
      </Dialog>
      {guardElement}
    </>
  );
};

export default CreateOrganizationDialog;
