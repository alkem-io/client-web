import { CheckCircle2, ClipboardCheck, MailWarning, Send, UserCheck, UserMinus } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';
import { Textarea } from '@/crd/primitives/textarea';

export type InviteRole = 'Member' | 'Lead' | 'Admin';

/** Who the dialog is inviting — drives search source, allowed roles, and which optional
 * controls (email paste, suggested language) are shown. */
export type InviteKind = 'user' | 'organization' | 'virtualContributor';

export type InvitationResult = {
  invitee: ContributorSelectorInvitee;
  /**
   * Each outcome's label is a complete, self-contained sentence (e.g.
   * `parentNotAuthorized` explains the inviter lacks parent-invite rights), so
   * the result row renders the label as-is — no extra message is appended.
   *
   * `alreadyInvited`, `alreadyMember` and `alreadyHasApplication` are
   * informational (the invite simply wasn't needed/possible), not failures, so
   * they render in a neutral tone. `notAcceptingInvitations` and
   * `leadLimitReached` (organization kind only) are likewise informational —
   * nothing was created, but nothing failed either. Only `parentNotAuthorized`
   * and `error` are treated as failures.
   */
  outcome:
    | 'sent'
    | 'alreadyInvited'
    | 'alreadyMember'
    | 'alreadyHasApplication'
    | 'parentNotAuthorized'
    | 'notAcceptingInvitations'
    | 'leadLimitReached'
    | 'error';
  /** Informational addendum rendered as an extra line on a `sent` row (organization kind). */
  notice?: 'noAdministrators';
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
  /** Label for the informational addendum rendered under a `sent` row's outcome label. */
  resultNoticeLabels?: Record<NonNullable<InvitationResult['notice']>, string>;
  /** Label for the suggested-language select (T013). */
  suggestedLanguageLabel?: string;
  suggestedLanguagePlaceholder?: string;
  /** Label for the "no preference" option that clears the suggested language (FR-015: absent when untouched). */
  suggestedLanguageNoPreferenceLabel?: string;
};

export type InviteMembersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** Who is being invited — drives allowed roles and which optional controls show (default 'user'). */
  kind?: InviteKind;

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

  /**
   * Suggested language for the invitee (T013 — FR-014 / FR-015).
   * Hidden entirely when `availableLanguages` is empty (R-8 client kill-switch).
   * Pass undefined to omit from the payload (FR-015: absent when untouched).
   */
  suggestedLanguage?: string;
  onSuggestedLanguageChange?: (lang: string | undefined) => void;
  /** Full list of eligible languages. When empty, the control is hidden. */
  availableLanguages?: Array<{ code: string; label: string }>;

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
const OPTIONAL_ROLES_BY_KIND: Record<InviteKind, InviteRole[]> = {
  user: ['Lead', 'Admin'],
  organization: ['Lead'],
  virtualContributor: [],
};

/** Sentinel value for the "no preference" SelectItem (Radix forbids empty-string values). */
const NO_LANGUAGE_SENTINEL = '__none__';

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
  kind = 'user',
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
  allowEmailInvites: allowEmailInvitesProp = true,
  welcomeMessage,
  onWelcomeMessageChange,
  suggestedLanguage,
  onSuggestedLanguageChange,
  availableLanguages = [],
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

  // Email paste and the suggested-language control only ever apply to user invitees.
  const allowEmailInvites = kind === 'user' && allowEmailInvitesProp;
  const optionalRoles = OPTIONAL_ROLES_BY_KIND[kind];
  const showLanguageControl = kind === 'user' && availableLanguages.length > 0 && Boolean(onSuggestedLanguageChange);

  const hasInvalidChips = selectedContributors.some(c => c.kind === 'email' && c.validationError !== undefined);
  const messageEmpty = welcomeMessage.trim().length === 0;
  const missingMemberRole = !extraRoles.includes('Member');
  const sendDisabled =
    sending || selectedContributors.length === 0 || hasInvalidChips || messageEmpty || missingMemberRole;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden', className)}
        closeLabel={labels.closeAriaLabel}
      >
        <DialogTitle className="shrink-0">{labels.title}</DialogTitle>

        {view === 'form' ? (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">
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

              {/* T013 — Suggested language control. User kind only; hidden when eligible set is empty (R-8 kill-switch). */}
              {showLanguageControl && onSuggestedLanguageChange && (
                <div className="flex flex-col gap-2">
                  <label className="text-body-emphasis text-foreground" htmlFor="invite-members-language">
                    {labels.suggestedLanguageLabel}
                  </label>
                  <Select
                    value={suggestedLanguage ?? NO_LANGUAGE_SENTINEL}
                    onValueChange={val => onSuggestedLanguageChange(val === NO_LANGUAGE_SENTINEL ? undefined : val)}
                    disabled={sending}
                  >
                    <SelectTrigger
                      id="invite-members-language"
                      className="w-full sm:w-[200px]"
                      aria-label={labels.suggestedLanguageLabel}
                    >
                      <SelectValue placeholder={labels.suggestedLanguagePlaceholder ?? ''} />
                    </SelectTrigger>
                    <SelectContent>
                      {/* "No preference" option — sentinel maps to undefined so FR-015 optional-send holds */}
                      <SelectItem value={NO_LANGUAGE_SENTINEL}>
                        {labels.suggestedLanguageNoPreferenceLabel ?? '—'}
                      </SelectItem>
                      {availableLanguages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {errorSlot}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-caption text-muted-foreground max-w-md">{labels.emailVisibilityNote}</p>
                <RoleMultiSelect<InviteRole>
                  value={extraRoles}
                  onChange={onExtraRolesChange}
                  lockedRoles={LOCKED_ROLES}
                  optionalRoles={optionalRoles}
                  roleLabels={labels.roleLabels}
                  triggerLabel={labels.inviteToRoleLabel}
                  triggerAriaLabel={labels.rolePopoverAriaLabel}
                  helperText={labels.rolePopoverHelper}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 shrink-0">
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
            noticeLabels={labels.resultNoticeLabels}
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
  noticeLabels,
  onBack,
  onClose,
  backLabel,
  closeLabel,
  spaceName,
}: {
  results: InvitationResult[];
  outcomeLabels: InviteMembersDialogLabels['resultOutcomeLabels'];
  noticeLabels: InviteMembersDialogLabels['resultNoticeLabels'];
  onBack: () => void;
  onClose: () => void;
  backLabel: string;
  closeLabel: string;
  spaceName: string;
}) {
  return (
    <>
      <DialogDescription className="shrink-0">
        {results.length} invitation{results.length === 1 ? '' : 's'} processed for {spaceName}.
      </DialogDescription>
      <ul className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto">
        {results.map((result, index) => (
          <ResultRow
            // biome-ignore lint/suspicious/noArrayIndexKey: results array is stable for the lifetime of the result view
            key={index}
            result={result}
            outcomeLabel={outcomeLabels[result.outcome]}
            noticeLabel={result.notice ? noticeLabels?.[result.notice] : undefined}
          />
        ))}
      </ul>
      <div className="flex justify-end gap-2 pt-2 shrink-0">
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

function ResultRow({
  result,
  outcomeLabel,
  noticeLabel,
}: {
  result: InvitationResult;
  outcomeLabel: string;
  noticeLabel?: string;
}) {
  const labelText =
    result.invitee.kind === 'user'
      ? result.invitee.displayName
      : result.invitee.kind === 'email'
        ? result.invitee.email
        : result.invitee.displayName;
  const isNeutral =
    result.outcome === 'alreadyInvited' ||
    result.outcome === 'alreadyMember' ||
    result.outcome === 'alreadyHasApplication' ||
    result.outcome === 'notAcceptingInvitations' ||
    result.outcome === 'leadLimitReached';
  const Icon =
    result.outcome === 'sent'
      ? CheckCircle2
      : result.outcome === 'alreadyMember'
        ? UserCheck
        : result.outcome === 'alreadyHasApplication'
          ? ClipboardCheck
          : result.outcome === 'alreadyInvited'
            ? UserMinus
            : MailWarning;
  const tone = result.outcome === 'sent' ? 'text-success' : isNeutral ? 'text-muted-foreground' : 'text-destructive';

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
          <span className="truncate">{outcomeLabel}</span>
        </p>
        {noticeLabel && <p className="text-caption text-muted-foreground truncate">{noticeLabel}</p>}
      </div>
    </li>
  );
}
