import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useUpdateUserMutation, useUserQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { UserEditForm } from '@/crd/components/admin/users/UserEditForm';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import type { ReferenceRow } from '@/crd/forms/references/ReferencesEditor';
import { COUNTRIES } from '@/domain/common/location/countries.constants';
import { useSeededFormState } from '@/main/crdPages/utils/useSeededFormState';
import { EMPTY_USER_FORM, mapUserToFormValues, toUpdateUserInput } from './userDetailMapper';

/**
 * Platform-admin user detail/edit page. Reuses `useUserQuery` +
 * `useUpdateUserMutation`; loads + maps the profile, saves via the mapper, and
 * returns to the list on success. Email is read-only (changed via the
 * change-email dialog). A discard guard confirms before leaving with unsaved
 * changes (Cancel).
 */
const CrdAdminUserPage = () => {
  const { t } = useTranslation('crd-admin');
  const navigate = useNavigate();
  const notify = useNotification();
  const { userId } = useParams<{ userId: string }>();

  const { data } = useUserQuery({
    variables: { id: userId ?? '' },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });
  const user = data?.lookup.user;

  // 027: the admin area admits roles that may READ a user record without being
  // able to UPDATE it — Platform Users Admin holds READ + PII read for the
  // account lifecycle and no user-record CRUD (FR-003). Read the server's own
  // verdict rather than guessing from the viewer's role: this page must reflect
  // what the API will accept, and `updateUser` is gated on UPDATE of THIS user.
  // Affordance only, never a permission check — the server stays the authority.
  const canUpdate = user?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;

  // Seeds the form from the loaded user and re-seeds if the route target changes
  // (the page instance is reused across `:userId`), so we never edit/save the
  // wrong user's data.
  const { values, setValues, isDirty, seeded } = useSeededFormState({
    seedKey: userId ?? '',
    ready: Boolean(user),
    computeSeed: () => (user ? mapUserToFormValues(user) : EMPTY_USER_FORM),
    empty: EMPTY_USER_FORM,
  });

  const [updateUser, { loading: updating }] = useUpdateUserMutation();

  const goToList = () => navigate('/admin/users');

  const handleSubmit = () => {
    if (!userId) return;
    // Navigate/notify only on success; the global Apollo error handler surfaces
    // failures. The empty catch keeps a rejected mutation from becoming an
    // unhandled promise rejection.
    void updateUser({ variables: { input: toUpdateUserInput(userId, values) } })
      .then(() => {
        notify(t('userForm.updated'), 'success');
        goToList();
      })
      .catch(() => undefined);
  };

  const [discardOpen, setDiscardOpen] = useState(false);
  const handleCancel = () => {
    if (isDirty) setDiscardOpen(true);
    else goToList();
  };

  if (!seeded) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-page-title">
        {canUpdate
          ? t('userForm.editTitle', { name: values.displayName })
          : t('userForm.viewTitle', { name: values.displayName })}
      </h1>

      <UserEditForm
        values={values}
        onChange={patch => setValues(prev => ({ ...prev, ...patch }))}
        onReferencesChange={(rows: ReferenceRow[]) => setValues(prev => ({ ...prev, references: rows }))}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitting={updating}
        countries={COUNTRIES}
        readOnly={!canUpdate}
        readOnlyNotice={t('userForm.readOnlyNotice')}
      />

      <ConfirmationDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        variant="destructive"
        title={t('userForm.discardTitle')}
        description={t('userForm.discardDescription')}
        confirmLabel={t('userForm.discard')}
        onConfirm={goToList}
      />
    </div>
  );
};

export default CrdAdminUserPage;
