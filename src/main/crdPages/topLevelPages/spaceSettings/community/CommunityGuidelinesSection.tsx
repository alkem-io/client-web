import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CommunityGuidelinesEditor } from '@/crd/components/space/settings/CommunityGuidelinesEditor';
import { CommunityGuidelinesPreview } from '@/crd/components/space/settings/CommunityGuidelinesPreview';
import { SettingsEditorDialog } from '@/crd/components/space/settings/SettingsEditorDialog';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import { Button } from '@/crd/primitives/button';
import type { UseCommunityGuidelinesDataResult } from './useCommunityGuidelinesData';

type CommunityGuidelinesSectionProps = {
  guidelines: UseCommunityGuidelinesDataResult;
  onApplyTemplate: () => void;
  onSaveAsTemplate: () => void;
  markdown: MarkdownUploadProps;
};

/** Community tab → Community Guidelines: rendered preview inline, editing (and templates) in a dialog. */
export function CommunityGuidelinesSection({
  guidelines,
  onApplyTemplate,
  onSaveAsTemplate,
  markdown,
}: CommunityGuidelinesSectionProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const [editing, setEditing] = useState(false);

  return (
    <>
      <CommunityGuidelinesPreview
        value={guidelines.value}
        loading={guidelines.loading}
        onEdit={() => setEditing(true)}
      />
      <SettingsEditorDialog
        open={editing}
        title={t('community.guidelines.title')}
        isDirty={guidelines.isDirty}
        canSave={guidelines.canSave}
        saving={guidelines.submitting}
        onSave={guidelines.onSave}
        onDiscard={guidelines.onReset}
        onClose={() => setEditing(false)}
        headerActions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onApplyTemplate}
              disabled={guidelines.submitting}
            >
              {t('community.guidelines.applyTemplate')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSaveAsTemplate}
              disabled={guidelines.submitting}
            >
              {t('community.guidelines.saveAsTemplate')}
            </Button>
          </>
        }
      >
        <CommunityGuidelinesEditor
          value={guidelines.value}
          loading={guidelines.loading}
          submitting={guidelines.submitting}
          canSave={guidelines.canSave}
          onChange={guidelines.onChange}
          onSave={() => void guidelines.onSave()}
          onReferenceFileUpload={guidelines.onReferenceFileUpload}
          referenceUploadAccept={guidelines.referenceUploadAccept}
          hideActions={true}
          {...markdown}
        />
      </SettingsEditorDialog>
    </>
  );
}
