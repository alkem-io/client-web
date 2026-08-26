/**
 * WhiteboardTemplateFormConnector — the integration-layer wrapper for the whiteboard-template form.
 * A pure `src/crd/` component can't host the live Excalidraw editor (it needs Apollo / the whiteboard
 * stack), so this connector renders the shared `WhiteboardConfigCard` ("Whiteboard · Edit drawing" — the
 * same row the callout whiteboard-framing editor uses). Existing templates open their real Whiteboard
 * entity: uploads therefore target the template's real storage bucket and edits travel over the live
 * collaboration channel. Creating a template materializes that entity before opening the editor, so
 * snapshots remain on the collaboration transport instead of crossing GraphQL.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWhiteboardDetailsByIdQuery } from '@/core/apollo/generated/apollo-hooks';
import type { WhiteboardTemplateValues } from '@/crd/components/templates/types';
import { WhiteboardConfigCard } from '@/crd/components/whiteboard/WhiteboardConfigCard';
import buildGuestShareUrl from '@/domain/collaboration/whiteboard/utils/buildGuestShareUrl';
import CrdWhiteboardView from '@/main/crdPages/whiteboard/CrdWhiteboardView';

export type WhiteboardTemplateFormConnectorProps = {
  value: WhiteboardTemplateValues;
  /** The template-owned Whiteboard. Omit for create/duplicate drafts: their source must not be edited. */
  editableWhiteboardId?: string;
  /** Materialize the template-owned Whiteboard before opening a new template's live editor. */
  onMaterialize?: () => Promise<boolean>;
  disabled?: boolean;
};

export function WhiteboardTemplateFormConnector({
  value,
  editableWhiteboardId,
  onMaterialize,
  disabled,
}: WhiteboardTemplateFormConnectorProps) {
  const { t } = useTranslation('crd-templates');
  const [editorOpen, setEditorOpen] = useState(false);

  const { data, loading } = useWhiteboardDetailsByIdQuery({
    variables: { whiteboardId: editableWhiteboardId ?? '' },
    skip: !editableWhiteboardId,
  });
  const whiteboard = data?.lookup.whiteboard;

  const openEditor = async () => {
    if (!editableWhiteboardId && !(await onMaterialize?.())) return;
    setEditorOpen(true);
  };

  return (
    <div className="space-y-4">
      <WhiteboardConfigCard
        title={t('form.whiteboard.drawing')}
        status={!editableWhiteboardId ? t('preview.whiteboard.empty') : undefined}
        actionLabel={editableWhiteboardId ? t('form.whiteboard.editDrawing') : t('form.whiteboard.startDrawing')}
        onAction={() => void openEditor()}
        disabled={disabled || loading || (editableWhiteboardId ? !whiteboard : !onMaterialize)}
      />

      {editorOpen && whiteboard && (
        <CrdWhiteboardView
          whiteboardId={whiteboard.id}
          whiteboard={whiteboard}
          authorization={whiteboard.authorization}
          whiteboardShareUrl={whiteboard.profile.url ?? ''}
          guestShareUrl={buildGuestShareUrl(whiteboard.id)}
          displayName={value.name || whiteboard.profile.displayName}
          readOnlyDisplayName={true}
          loadingWhiteboards={loading}
          preventWhiteboardDeletion={true}
          backToWhiteboards={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}
