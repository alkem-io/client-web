import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApplicationFormEditor } from '@/crd/components/space/settings/ApplicationFormEditor';
import { ApplicationFormPreview } from '@/crd/components/space/settings/ApplicationFormPreview';
import { SettingsEditorDialog } from '@/crd/components/space/settings/SettingsEditorDialog';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import type { UseApplicationFormDataResult } from '../settings/useApplicationFormData';

type ApplicationFormSectionProps = {
  form: UseApplicationFormDataResult;
  onExportApplications?: () => void;
  exportDisabled?: boolean;
  markdown: MarkdownUploadProps;
};

/** Community tab → Application Form: question preview inline, editing in a dialog. */
export function ApplicationFormSection({
  form,
  onExportApplications,
  exportDisabled,
  markdown,
}: ApplicationFormSectionProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const [editing, setEditing] = useState(false);

  return (
    <>
      <ApplicationFormPreview
        questions={form.questions}
        loading={form.loading && !editing}
        onEdit={() => setEditing(true)}
        onExportApplications={onExportApplications}
        exportDisabled={exportDisabled}
      />
      <SettingsEditorDialog
        open={editing}
        title={t('community.applicationForm.title')}
        isDirty={form.isDirty}
        canSave={form.canSave}
        saving={form.submitting}
        onSave={form.onSave}
        onDiscard={form.onReset}
        onClose={() => setEditing(false)}
      >
        <ApplicationFormEditor
          description={form.description}
          questions={form.questions}
          loading={form.loading}
          canSave={form.canSave}
          onDescriptionChange={form.onDescriptionChange}
          onQuestionChange={form.onQuestionChange}
          onQuestionRequiredChange={form.onQuestionRequiredChange}
          onQuestionAdd={form.onQuestionAdd}
          onQuestionDelete={form.onQuestionDelete}
          onQuestionMoveUp={form.onQuestionMoveUp}
          onQuestionMoveDown={form.onQuestionMoveDown}
          onSave={() => void form.onSave()}
          hideSaveButton={true}
          {...markdown}
        />
      </SettingsEditorDialog>
    </>
  );
}
