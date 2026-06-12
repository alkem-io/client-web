import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActorSwitches } from '@/crd/forms/callout/ActorSwitches';
import { LinksPrePopulateRows } from '@/crd/forms/callout/LinksPrePopulateRows';
import type { AllowedActors, LinkRow, ResponseType } from '@/crd/forms/callout/types';
import { Button } from '@/crd/primitives/button';
import { Label } from '@/crd/primitives/label';
import { Switch } from '@/crd/primitives/switch';

export type ResponsePanelProps = {
  type: ResponseType;
  allowedActors: AllowedActors;
  onAllowedActorsChange: (next: AllowedActors) => void;
  /** Posts-only contribution-level comments switch (FR-32). */
  contributionCommentsEnabled: boolean;
  onContributionCommentsEnabledChange: (value: boolean) => void;
  /**
   * Whether the Posts contribution-comments switch is shown. Defaults to `true`.
   * A consumer sets `false` to hide it (and keep comments off) — e.g. a Virtual
   * Contributor's knowledge base, which does not support comments.
   */
  showContributionComments?: boolean;
  /** Pre-populate link rows (create-mode only). Pass `undefined` to hide. */
  prePopulateLinkRows?: LinkRow[];
  onPrePopulateLinkRowsChange?: (rows: LinkRow[]) => void;
  prePopulateLinkErrors?: Record<string, string | undefined>;
  /**
   * Optional file-attach for pre-populate link rows — wires the per-row
   * paperclip (the "& Files" half of "Links & Files"). Same upload callback
   * the References editor uses. Returns the resolved URL, or `null` on failure.
   */
  prePopulateLinkFileUpload?: (file: File) => Promise<string | null>;
  /** `accept` attribute for the pre-populate link file picker. */
  prePopulateLinkUploadAccept?: string;
  /**
   * Click handler for "Set Default Response" button (opens the nested dialog
   * via the connector). Rendered for post / memo / whiteboard types.
   */
  onSetDefaults?: () => void;
  disabled?: boolean;
};

/**
 * Dispatches on `type` to render the right sub-panel: Links, Posts, Memos,
 * Whiteboards, or Documents (placeholder). Hidden when `type === 'none'`.
 * Spec FR-30..FR-36.
 */
export function ResponsePanel(props: ResponsePanelProps) {
  const { type } = props;
  if (type === 'none') return null;

  switch (type) {
    case 'link':
      return <LinksPanel {...props} />;
    case 'post':
      return <PostsPanel {...props} />;
    case 'memo':
      return <SimpleContributionPanel {...props} />;
    case 'whiteboard':
      return <SimpleContributionPanel {...props} />;
    default:
      return null;
  }
}

function LinksPanel(props: ResponsePanelProps) {
  const {
    allowedActors,
    onAllowedActorsChange,
    prePopulateLinkRows,
    onPrePopulateLinkRowsChange,
    prePopulateLinkErrors,
    prePopulateLinkFileUpload,
    prePopulateLinkUploadAccept,
    disabled,
  } = props;

  return (
    <PanelWrapper>
      <ActorSwitches value={allowedActors} onChange={onAllowedActorsChange} disabled={disabled} />
      {prePopulateLinkRows !== undefined && onPrePopulateLinkRowsChange && (
        <LinksPrePopulateRows
          rows={prePopulateLinkRows}
          onChange={onPrePopulateLinkRowsChange}
          errors={prePopulateLinkErrors}
          disabled={disabled}
          onFileUpload={prePopulateLinkFileUpload}
          uploadAccept={prePopulateLinkUploadAccept}
        />
      )}
    </PanelWrapper>
  );
}

function PostsPanel(props: ResponsePanelProps) {
  const {
    allowedActors,
    onAllowedActorsChange,
    contributionCommentsEnabled,
    onContributionCommentsEnabledChange,
    showContributionComments = true,
    onSetDefaults,
    disabled,
  } = props;

  return (
    <PanelWrapper>
      <ActorSwitches value={allowedActors} onChange={onAllowedActorsChange} disabled={disabled} />
      {showContributionComments && (
        <PostsCommentsField
          value={contributionCommentsEnabled}
          onChange={onContributionCommentsEnabledChange}
          disabled={disabled}
        />
      )}
      {onSetDefaults && <SetDefaultsButton onClick={onSetDefaults} disabled={disabled} />}
    </PanelWrapper>
  );
}

function SimpleContributionPanel(props: ResponsePanelProps) {
  const { allowedActors, onAllowedActorsChange, onSetDefaults, disabled } = props;
  return (
    <PanelWrapper>
      <ActorSwitches value={allowedActors} onChange={onAllowedActorsChange} disabled={disabled} />
      {onSetDefaults && <SetDefaultsButton onClick={onSetDefaults} disabled={disabled} />}
    </PanelWrapper>
  );
}

function PanelWrapper({ children }: { children: ReactNode }) {
  return <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-4">{children}</div>;
}

function PostsCommentsField({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation('crd-space');
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="contribution-comments-enabled" className="text-body text-foreground">
        {t('contributionSettings.commentsEnabled')}
      </Label>
      <Switch
        id="contribution-comments-enabled"
        checked={value}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-label={t('contributionSettings.commentsEnabled')}
      />
    </div>
  );
}

function SetDefaultsButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  const { t } = useTranslation('crd-space');
  return (
    <div>
      <Button type="button" variant="outline" size="sm" onClick={onClick} disabled={disabled}>
        {t('contributionSettings.setDefaults')}
      </Button>
    </div>
  );
}
