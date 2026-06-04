import { CheckCircle2, MailWarning, Send, UserMinus } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import {
  ContributorSelector,
  type ContributorSelectorInvitee,
  type ContributorSelectorUserResult,
} from '@/crd/forms/ContributorSelector';
import { RoleMultiSelect } from '@/crd/forms/RoleMultiSelect';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/crd/primitives/dialog';
import { Textarea } from '@/crd/primitives/textarea';

export type InviteRole = 'Member' | 'Lead' | 'Admin';

export type InvitationResult = {
  invitee: ContributorSelectorInvitee;
  /**
   * `parentNotAuthorized` maps the server's `INVITATION_TO_PARENT_NOT_AUTHORIZED`
   * result — the invitee would also need to join the parent space and the
   * inviter lacks invite rights there. Its label carries the full explanation,
   * so (unlike `error`) no `errorMessage` is appended.
   */
  outcome: 'sent' | 'alreadyInvited' | 'parentNotAuthorized' | 'error';
  errorMessage?: string;
};

export type InviteMembersDialogLabels = {
  title: string;
  searchHint: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  noResultsLabel: string;
  loadingLabel: string;
  loadMoreLabel: string;
  removeAriaLabel: (label: string) => string;
  validationErrorLabel: (kind: 'invalid' | 'duplicate') => string;
  welcomeMessageLabel: string;
  welcomeMessagePlaceholder: string;
  emailVisibilityNote: string;
  inviteToRoleLabel: string;
  rolePopoverHelper: string;
  rolePopoverAriaLabel: string;
  roleLabels: Record<InviteRole, string>;
  sendButtonLabel: string;
  sendingButtonLabel: string;
  backButtonLabel: string;
  closeButtonLabel: string;
  closeAriaLabel: string;
  resultOutcomeLabels: Record<InvitationResult['outcome'], string>;
};

export type InviteMembersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** Empty string while the underlying space query is loading; renders a placeholder title. */
  spaceName: string;

  selectedContributors: ContributorSelectorInvitee[];
  searchResults: ContributorSelectorUserResult[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectUser: (userId: string) => void;
  onAddEmails?: (rawText: string) => void;
  onRemoveContributor: (index: number) => void;
  searchLoading?: boolean;
  hasMoreSearchResults?: boolean;
  onLoadMoreSearchResults?: () => void;

  /** When false (default true): hides the email-paste path. */
  allowEmailInvites?: boolean;

  welcomeMessage: string;
  onWelcomeMessageChange: (next: string) => void;

  extraRoles: InviteRole[];
  onExtraRolesChange: (next: InviteRole[]) => void;

  /** True while the connector's mutation is in flight. */
  sending?: boolean;
  /** When defined, dialog renders the result view. */
  results?: InvitationResult[];

  onSend: () => void;
  /** Clears chips + results; the dialog auto-returns to the form view. */
  onBack: () => void;

  labels: InviteMembersDialogLabels;

  /** Optional content rendered between the message field and the role/footer row (e.g. error toast). */
  errorSlot?: ReactNode;

  className?: string;
};

const LOCKED_ROLES: InviteRole[] = ['Member'];
const OPTIONAL_ROLES: InviteRole[] = ['Lead', 'Admin'];

/**
 * Pure CRD presentational dialog for inviting members. Owns only visual state:
 *
 *   - which view is showing (form ↔ result)
 *
 * All other state (selected contributors, message, role, results, sending) is
 * passed in by the connector. The dialog auto-resets to the form view whenever
 * `open` flips false → true OR `results` becomes undefined — that's the
 * single source of truth and the connector doesn't have to micromanage it.
 *
 * Send-disabled rules (per data-model.md § InvitationBatch):
 *   - no chips
 *   - any chip has a validation error
 *   - welcomeMessage is empty / whitespace
 *   - extraRoles missing 'Member' (defensive — UI prevents it via lockedRoles)
 *   - sending in flight
 */
export function InviteMembersDialog({
  open,
  onOpenChange,
  spaceName,
  selectedContributors,
  searchResults,
  searchQuery,
  onSearchChange,
  onSelectUser,
  onAddEmails,
  onRemoveContributor,
  searchLoading,
  hasMoreSearchResults,
  onLoadMoreSearchResults,
  allowEmailInvites = true,
  welcomeMessage,
  onWelcomeMessageChange,
  extraRoles,
  onExtraRolesChange,
  sending = false,
  results,
  onSend,
  onBack,
  labels,
  errorSlot,
  className,
}: InviteMembersDialogProps) {
  const [view, setView] = useState<'form' | 'result'>('form');

  useEffect(() => {
    if (open) setView('form');
  }, [open]);

  useEffect(() => {
    setView(results === undefined ? 'form' : 'result');
  }, [results]);

  const hasInvalidChips = selectedContributors.some(c => c.kind === 'email' && c.validationError !== undefined);
  const messageEmpty = welcomeMessage.trim().length === 0;
  const missingMemberRole = !extraRoles.includes('Member');
  const sendDisabled =
    sending || selectedContributors.length === 0 || hasInvalidChips || messageEmpty || missingMemberRole;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-2xl', className)} closeLabel={labels.closeAriaLabel}>
        <DialogTitle>{labels.title}</DialogTitle>

        {view === 'form' ? (
          <>
            <DialogDescription>{labels.searchHint}</DialogDescription>

            <ContributorSelector
              selectedContributors={selectedContributors}
              searchResults={searchResults}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              onSelectUser={onSelectUser}
              onAddEmails={onAddEmails}
              onRemoveContributor={onRemoveContributor}
              loading={searchLoading}
              hasMore={hasMoreSearchResults}
              onLoadMore={onLoadMoreSearchResults}
              allowEmailInvites={allowEmailInvites}
              placeholder={labels.searchPlaceholder}
              searchAriaLabel={labels.searchAriaLabel}
              noResultsLabel={labels.noResultsLabel}
              loadingLabel={labels.loadingLabel}
              loadMoreLabel={labels.loadMoreLabel}
              removeAriaLabel={labels.removeAriaLabel}
              validationErrorLabel={labels.validationErrorLabel}
            />

            <div className="flex flex-col gap-2">
              <label className="text-body-emphasis text-foreground" htmlFor="invite-members-welcome">
                {labels.welcomeMessageLabel}
              </label>
              <Textarea
                id="invite-members-welcome"
                value={welcomeMessage}
                onChange={e => onWelcomeMessageChange(e.target.value)}
                placeholder={labels.welcomeMessagePlaceholder}
                className="min-h-[6rem]"
                aria-label={labels.welcomeMessageLabel}
                disabled={sending}
              />
            </div>

            {errorSlot}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-caption text-muted-foreground max-w-md">{labels.emailVisibilityNote}</p>
              <RoleMultiSelect<InviteRole>
                value={extraRoles}
                onChange={onExtraRolesChange}
                lockedRoles={LOCKED_ROLES}
                optionalRoles={OPTIONAL_ROLES}
                roleLabels={labels.roleLabels}
                triggerLabel={labels.inviteToRoleLabel}
                triggerAriaLabel={labels.rolePopoverAriaLabel}
                helperText={labels.rolePopoverHelper}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="button" disabled={sendDisabled} aria-busy={sending} onClick={onSend} className="gap-2">
                <Send className="size-4" aria-hidden="true" />
                {sending ? labels.sendingButtonLabel : labels.sendButtonLabel}
              </Button>
            </div>
          </>
        ) : (
          <ResultView
            results={results ?? []}
            outcomeLabels={labels.resultOutcomeLabels}
            onBack={onBack}
            onClose={() => onOpenChange(false)}
            backLabel={labels.backButtonLabel}
            closeLabel={labels.closeButtonLabel}
            spaceName={spaceName}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ResultView({
  results,
  outcomeLabels,
  onBack,
  onClose,
  backLabel,
  closeLabel,
  spaceName,
}: {
  results: InvitationResult[];
  outcomeLabels: InviteMembersDialogLabels['resultOutcomeLabels'];
  onBack: () => void;
  onClose: () => void;
  backLabel: string;
  closeLabel: string;
  spaceName: string;
}) {
  return (
    <>
      <DialogDescription>
        {results.length} invitation{results.length === 1 ? '' : 's'} processed for {spaceName}.
      </DialogDescription>
      <ul className="flex flex-col gap-2 max-h-[20rem] overflow-y-auto">
        {results.map((result, index) => (
          <ResultRow
            // biome-ignore lint/suspicious/noArrayIndexKey: results array is stable for the lifetime of the result view
            key={index}
            result={result}
            outcomeLabel={outcomeLabels[result.outcome]}
          />
        ))}
      </ul>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          {backLabel}
        </Button>
        <Button type="button" onClick={onClose}>
          {closeLabel}
        </Button>
      </div>
    </>
  );
}

function ResultRow({ result, outcomeLabel }: { result: InvitationResult; outcomeLabel: string }) {
  const labelText = result.invitee.kind === 'user' ? result.invitee.displayName : result.invitee.email;
  const Icon = result.outcome === 'sent' ? CheckCircle2 : result.outcome === 'alreadyInvited' ? UserMinus : MailWarning;
  const tone =
    result.outcome === 'sent'
      ? 'text-success'
      : result.outcome === 'alreadyInvited'
        ? 'text-muted-foreground'
        : 'text-destructive';

  return (
    <li className="flex items-center gap-3 p-3 rounded-md border border-border">
      {result.invitee.kind === 'user' ? (
        <Avatar className="size-8">
          {result.invitee.avatarUrl && <AvatarImage src={result.invitee.avatarUrl} alt="" />}
          <AvatarFallback className="text-badge">{labelText.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
      ) : (
        <span
          className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
          aria-hidden="true"
        >
          @
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-control truncate" title={labelText}>
          {labelText}
        </p>
        <p className={cn('text-caption flex items-center gap-1', tone)}>
          <Icon className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {outcomeLabel}
            {result.outcome === 'error' && result.errorMessage ? `: ${result.errorMessage}` : ''}
          </span>
        </p>
      </div>
    </li>
  );
}
