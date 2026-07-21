import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  useCreateOrganizationMutation,
  useOrganizationProfileInfoQuery,
  useUpdateOrganizationMutation,
} from '@/core/apollo/generated/apollo-hooks';
import clearCacheForQuery from '@/core/apollo/utils/clearCacheForQuery';
import useNavigate from '@/core/routing/useNavigate';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { OrganizationForm } from '@/crd/components/admin/organizations/OrganizationForm';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import type { ReferenceRow } from '@/crd/forms/references/ReferencesEditor';
import { toRoutePath } from '@/crd/lib/toRoutePath';
import { COUNTRIES } from '@/domain/common/location/countries.constants';
import { useSeededFormState } from '@/main/crdPages/utils/useSeededFormState';
import { EMPTY_ORG_FORM, mapOrgToFormValues, toCreateInput, toUpdateInput } from './orgFormMapper';

type CrdOrganizationFormPageProps = {
  /**
   * Where Cancel / discard / a completed edit returns to. Omit to go back in
   * history — used by the standalone `/organization/new` route, which can be
   * reached from more than one place.
   */
  returnUrl?: string;
};

/**
 * Organization create / edit page, shared by the platform-admin section
 * (`/admin/organizations/new` + `/:orgId/edit`) and the standalone create route
 * (`/organization/new`, open to holders of the `CreateOrganization` platform
 * privilege). Builds the single-submit input via the mapper; a successful
 * create lands on the new organization's profile, an edit returns to
 * `returnUrl`. A discard guard confirms before leaving with unsaved changes.
 */
const CrdOrganizationFormPage = ({ returnUrl }: CrdOrganizationFormPageProps) => {
  const { t } = useTranslation('crd-admin');
  const navigate = useNavigate();
  const notify = useNotification();
  const { orgId } = useParams<{ orgId: string }>();
  const mode = orgId ? 'edit' : 'create';

  const { data } = useOrganizationProfileInfoQuery({
    variables: { id: orgId ?? '' },
    skip: !orgId,
    fetchPolicy: 'cache-and-network',
  });
  const org = data?.lookup.organization;

  // Seeds the form from the loaded org and re-seeds if the route target changes
  // (the page instance is reused across `:orgId`), so we never edit/save the
  // wrong organization's data.
  const { values, setValues, isDirty, seeded } = useSeededFormState({
    seedKey: orgId ?? 'new',
    ready: mode === 'create' || Boolean(org),
    computeSeed: () => (org ? mapOrgToFormValues(org) : EMPTY_ORG_FORM),
    empty: EMPTY_ORG_FORM,
  });

  const [createOrg, { loading: creating }] = useCreateOrganizationMutation({
    update: cache => clearCacheForQuery(cache, 'organizationsPaginated'),
  });
  const [updateOrg, { loading: updating }] = useUpdateOrganizationMutation();
  const submitting = creating || updating;

  const goBack = () => (returnUrl ? navigate(returnUrl) : navigate(-1));

  const handleSubmit = () => {
    // Navigate/notify only on success; the global Apollo error handler surfaces
    // failures. The empty catch keeps a rejected mutation from becoming an
    // unhandled promise rejection.
    if (mode === 'create') {
      void createOrg({ variables: { input: toCreateInput(values) } })
        .then(({ data: created }) => {
          notify(t('orgForm.created'), 'success');
          // Land on the organization that was just created, from both the admin
          // and the standalone route. `profile.url` is a full URL server-side,
          // so it has to go through `toRoutePath` before react-router sees it.
          const createdUrl = created?.createOrganization.profile?.url;
          if (createdUrl) {
            navigate(toRoutePath(createdUrl));
          } else {
            goBack();
          }
        })
        .catch(() => undefined);
      return;
    }
    if (orgId) {
      void updateOrg({ variables: { input: toUpdateInput(orgId, values) } })
        .then(() => {
          notify(t('orgForm.updated'), 'success');
          goBack();
        })
        .catch(() => undefined);
    }
  };

  const [discardOpen, setDiscardOpen] = useState(false);
  const handleCancel = () => {
    if (isDirty) setDiscardOpen(true);
    else goBack();
  };

  if (mode === 'edit' && !seeded) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-page-title">{mode === 'create' ? t('orgForm.createTitle') : t('orgForm.editTitle')}</h1>

      <OrganizationForm
        mode={mode}
        values={values}
        onChange={patch => setValues(prev => ({ ...prev, ...patch }))}
        onReferencesChange={(rows: ReferenceRow[]) => setValues(prev => ({ ...prev, references: rows }))}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitting={submitting}
        countries={COUNTRIES}
      />

      <ConfirmationDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        variant="destructive"
        title={t('orgForm.discardTitle')}
        description={t('orgForm.discardDescription')}
        confirmLabel={t('orgForm.discard')}
        onConfirm={goBack}
      />
    </div>
  );
};

export default CrdOrganizationFormPage;
