import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  MailWarning,
  Plus,
  Search,
  Send,
  UserCheck,
  UserMinus,
} from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { VirtualContributorPreview } from '@/crd/components/virtualContributor/community/VirtualContributorPreview';
import type { VcPreviewData } from '@/crd/components/virtualContributor/community/VirtualContributorPreview.types';
import {
  ContributorSelector,
  type ContributorSelectorInvitee,
  type ContributorSelectorUserResult,
} from '@/crd/forms/ContributorSelector';
import { RoleMultiSelect } from '@/crd/forms/RoleMultiSelect';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
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

/** One row in the virtualContributor kind's account/library lists. */
export type VcInviteItem = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  /** Optional secondary line (e.g. the VC's engine/host). */
  subtitle?: string;
};

/** Labels specific to the virtualContributor kind's own sub-view (not the user/organization form). */
export type InviteMembersDialogVcLabels = {
  searchPlaceholder: string;
  loading: string;
  onAccount: string;
  onAccountEmpty: string;
  inLibrary: string;
  inLibraryEmpty: string;
  add: string;
  invite: string;
  addAriaLabel: (name: string) => string;
  inviteAriaLabel: (name: string) => string;
  previewAriaLabel: (name: string) => string;
  back: string;
  welcomeMessageLabel: string;
  welcomeMessagePlaceholder: string;
  sendInvite: string;
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

  // ---- virtualContributor kind only (T019) ----
  /** Virtual Contributors on the account — added directly, no message. */
  vcAccountItems?: VcInviteItem[];
  /** Virtual Contributors from the shared library — invited with a welcome message. */
  vcLibraryItems?: VcInviteItem[];
  onAddAccountVc?: (id: string) => void;
  onInviteLibraryVc?: (id: string, welcomeMessage: string) => void;
  /** Id of the VC currently being added/invited — its row shows a spinner. */
  vcBusyId?: string | null;
  /** Pre-fills the welcome-message step for library invites. */
  vcDefaultWelcomeMessage?: string;
  /** When true, only the library section is shown (the settings "Invite External
   * Virtual Contributor" entry — account VCs are added via a separate button there). */
  libraryOnly?: boolean;
  /** Detail data for the currently-previewed VC (set after `onPreviewVc`). */
  vcPreviewData?: VcPreviewData;
  /** True while the preview detail is being fetched. */
  vcPreviewLoading?: boolean;
  onPreviewVc?: (id: string) => void;
  onClosePreviewVc?: () => void;
  vcLabels?: InviteMembersDialogVcLabels;

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
  vcAccountItems,
  vcLibraryItems,
  onAddAccountVc,
  onInviteLibraryVc,
  vcBusyId,
  vcDefaultWelcomeMessage,
  libraryOnly = false,
  vcPreviewData,
  vcPreviewLoading,
  onPreviewVc,
  onClosePreviewVc,
  vcLabels,
  className,
}: InviteMembersDialogProps) {
  // The virtualContributor kind is a wholly different layout (account/library lists +
  // preview + message step, no search-select form, no role picker, no result view) —
  // branch out to its own self-contained render before any form/result state below.
  if (kind === 'virtualContributor') {
    return (
      <VcDialogBody
        open={open}
        onOpenChange={onOpenChange}
        title={labels.title}
        closeLabel={labels.closeAriaLabel}
        description={labels.searchHint}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        accountVcs={vcAccountItems ?? []}
        libraryVcs={vcLibraryItems ?? []}
        onAddAccountVc={onAddAccountVc ?? (() => {})}
        onInviteLibraryVc={onInviteLibraryVc ?? (() => {})}
        loading={searchLoading}
        busyId={vcBusyId}
        defaultWelcomeMessage={vcDefaultWelcomeMessage}
        libraryOnly={libraryOnly}
        previewData={vcPreviewData}
        previewLoading={vcPreviewLoading}
        onPreview={onPreviewVc}
        onClosePreview={onClosePreviewVc}
        labels={vcLabels}
        className={className}
      />
    );
  }

  return (
    <InviteMembersFormDialog
      open={open}
      onOpenChange={onOpenChange}
      kind={kind}
      spaceName={spaceName}
      selectedContributors={selectedContributors}
      searchResults={searchResults}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      onSelectUser={onSelectUser}
      onAddEmails={onAddEmails}
      onRemoveContributor={onRemoveContributor}
      searchLoading={searchLoading}
      hasMoreSearchResults={hasMoreSearchResults}
      onLoadMoreSearchResults={onLoadMoreSearchResults}
      allowEmailInvitesProp={allowEmailInvitesProp}
      welcomeMessage={welcomeMessage}
      onWelcomeMessageChange={onWelcomeMessageChange}
      suggestedLanguage={suggestedLanguage}
      onSuggestedLanguageChange={onSuggestedLanguageChange}
      availableLanguages={availableLanguages}
      extraRoles={extraRoles}
      onExtraRolesChange={onExtraRolesChange}
      sending={sending}
      results={results}
      onSend={onSend}
      onBack={onBack}
      labels={labels}
      errorSlot={errorSlot}
      className={className}
    />
  );
}

/** The user/organization search-select form + result view (everything the dialog did before T019). */
function InviteMembersFormDialog({
  open,
  onOpenChange,
  kind,
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
  allowEmailInvitesProp,
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
}: Omit<
  InviteMembersDialogProps,
  | 'vcAccountItems'
  | 'vcLibraryItems'
  | 'onAddAccountVc'
  | 'onInviteLibraryVc'
  | 'vcBusyId'
  | 'vcDefaultWelcomeMessage'
  | 'libraryOnly'
  | 'vcPreviewData'
  | 'vcPreviewLoading'
  | 'onPreviewVc'
  | 'onClosePreviewVc'
  | 'vcLabels'
  | 'kind'
  | 'allowEmailInvites'
> & { kind: Exclude<InviteKind, 'virtualContributor'>; allowEmailInvitesProp?: boolean }) {
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

// ─── virtualContributor kind (T019 — folded from the former standalone
// VirtualContributorInviteDialog; behavior ported 1:1, see the parity
// baseline in VirtualContributorInviteDialog.test.tsx pre-fold) ──────────

function VcDialogBody({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  searchQuery,
  onSearchChange,
  accountVcs,
  libraryVcs,
  onAddAccountVc,
  onInviteLibraryVc,
  loading,
  busyId,
  defaultWelcomeMessage = '',
  libraryOnly = false,
  previewData,
  previewLoading = false,
  onPreview,
  onClosePreview,
  labels,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  closeLabel: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  accountVcs: VcInviteItem[];
  libraryVcs: VcInviteItem[];
  onAddAccountVc: (id: string) => void;
  onInviteLibraryVc: (id: string, welcomeMessage: string) => void;
  loading?: boolean;
  busyId?: string | null;
  defaultWelcomeMessage?: string;
  libraryOnly?: boolean;
  previewData?: VcPreviewData;
  previewLoading?: boolean;
  onPreview?: (id: string) => void;
  onClosePreview?: () => void;
  labels?: InviteMembersDialogVcLabels;
  className?: string;
}) {
  const [messageVc, setMessageVc] = useState<VcInviteItem | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  // When set, the dialog shows the detail preview for a VC selected from the
  // given section; the action button adds (account) or opens the message step (library).
  const [previewSource, setPreviewSource] = useState<'account' | 'library' | null>(null);

  useEffect(() => {
    if (!open) {
      setMessageVc(null);
      setWelcomeMessage('');
      setPreviewSource(null);
    }
  }, [open]);

  if (!labels) return null;

  const openMessageStep = (vc: VcInviteItem) => {
    setMessageVc(vc);
    setWelcomeMessage(defaultWelcomeMessage);
  };

  const openPreview = (id: string, source: 'account' | 'library') => {
    setPreviewSource(source);
    onPreview?.(id);
  };

  const closePreview = () => {
    setPreviewSource(null);
    onClosePreview?.();
  };

  const onPreviewAction = () => {
    if (!previewData) return;
    if (previewSource === 'account') {
      onAddAccountVc(previewData.id);
      return;
    }
    // library → go to the welcome-message step
    setPreviewSource(null);
    openMessageStep({ id: previewData.id, displayName: previewData.displayName, avatarUrl: previewData.avatarUrl });
  };

  const messageEmpty = welcomeMessage.trim().length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('sm:max-w-xl md:max-w-2xl max-h-[80vh] flex flex-col overflow-hidden [&>*]:min-w-0', className)}
        closeLabel={closeLabel}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {messageVc && (
              <button
                type="button"
                onClick={() => setMessageVc(null)}
                aria-label={labels.back}
                className="rounded p-0.5 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
              </button>
            )}
            <Bot aria-hidden="true" className="size-4" />
            {title}
          </DialogTitle>
          {!messageVc && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {messageVc ? (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex flex-col gap-4 py-2 flex-1 min-h-0 overflow-y-auto">
              <div className="flex items-center gap-3">
                <VcAvatar vc={messageVc} />
                <span className="text-body-emphasis">{messageVc.displayName}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-body-emphasis">{labels.welcomeMessageLabel}</span>
                <Textarea
                  value={welcomeMessage}
                  onChange={e => setWelcomeMessage(e.target.value)}
                  placeholder={labels.welcomeMessagePlaceholder}
                  aria-label={labels.welcomeMessageLabel}
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 shrink-0">
              <Button type="button" variant="ghost" onClick={() => setMessageVc(null)}>
                {labels.back}
              </Button>
              <Button
                type="button"
                onClick={() => onInviteLibraryVc(messageVc.id, welcomeMessage.trim())}
                disabled={messageEmpty || busyId === messageVc.id}
                aria-busy={busyId === messageVc.id}
              >
                {busyId === messageVc.id ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <>
                    <Send aria-hidden="true" className="mr-1.5 size-4" />
                    {labels.sendInvite}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : previewSource ? (
          <VirtualContributorPreview
            data={previewData}
            loading={previewLoading}
            onBack={closePreview}
            onAction={onPreviewAction}
            actionLabel={previewSource === 'account' ? labels.add : labels.invite}
            actionBusy={Boolean(previewData) && busyId === previewData?.id}
          />
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="relative shrink-0 py-2">
              <Search
                aria-hidden="true"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              />
              <Input
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder={labels.searchPlaceholder}
                aria-label={labels.searchPlaceholder}
                className="h-9 pl-9 text-control"
              />
            </div>

            <div className="flex flex-col gap-4 py-2 flex-1 min-h-0 overflow-y-auto">
              {loading ? (
                <output className="block py-6 text-center text-muted-foreground" aria-label={labels.loading}>
                  <Loader2 aria-hidden="true" className="inline size-4 animate-spin" />
                </output>
              ) : (
                <>
                  {!libraryOnly && (
                    <VcSection
                      title={labels.onAccount}
                      emptyLabel={labels.onAccountEmpty}
                      vcs={accountVcs}
                      actionLabel={labels.add}
                      actionIcon="add"
                      busyId={busyId}
                      onAction={onAddAccountVc}
                      onPreview={id => openPreview(id, 'account')}
                      previewAriaLabel={labels.previewAriaLabel}
                      addAriaLabel={labels.addAriaLabel}
                    />
                  )}
                  <VcSection
                    title={labels.inLibrary}
                    emptyLabel={labels.inLibraryEmpty}
                    vcs={libraryVcs}
                    actionLabel={labels.invite}
                    actionIcon="invite"
                    busyId={busyId}
                    onAction={id => {
                      const vc = libraryVcs.find(v => v.id === id);
                      if (vc) openMessageStep(vc);
                    }}
                    onPreview={id => openPreview(id, 'library')}
                    previewAriaLabel={labels.previewAriaLabel}
                    addAriaLabel={labels.inviteAriaLabel}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function VcAvatar({ vc }: { vc: VcInviteItem }) {
  return (
    <Avatar className="size-8 shrink-0">
      {vc.avatarUrl ? <AvatarImage src={vc.avatarUrl} alt="" /> : null}
      <AvatarFallback
        style={{ background: 'color-mix(in srgb, var(--info) 15%, transparent)', color: 'var(--info)' }}
        className="text-badge"
      >
        {vc.displayName.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

function VcSection({
  title,
  emptyLabel,
  vcs,
  actionLabel,
  actionIcon,
  busyId,
  onAction,
  onPreview,
  previewAriaLabel,
  addAriaLabel,
}: {
  title: string;
  emptyLabel: string;
  vcs: VcInviteItem[];
  actionLabel: string;
  actionIcon: 'add' | 'invite';
  busyId?: string | null;
  onAction: (id: string) => void;
  onPreview: (id: string) => void;
  previewAriaLabel: (name: string) => string;
  addAriaLabel: (name: string) => string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="uppercase text-label text-muted-foreground">{title}</span>
      {vcs.length === 0 ? (
        <p className="text-caption text-muted-foreground px-1 py-2">{emptyLabel}</p>
      ) : (
        <ul className="rounded-lg border bg-card divide-y divide-border">
          {vcs.map(vc => {
            const busy = busyId === vc.id;
            return (
              <li key={vc.id} className="flex items-center justify-between gap-3 p-3">
                <button
                  type="button"
                  onClick={() => onPreview(vc.id)}
                  aria-label={previewAriaLabel(vc.displayName)}
                  className="flex items-center gap-3 min-w-0 rounded text-left outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <VcAvatar vc={vc} />
                  <div className="min-w-0">
                    <span className="block text-body-emphasis truncate">{vc.displayName}</span>
                    {vc.subtitle && (
                      <span className="block text-caption text-muted-foreground truncate">{vc.subtitle}</span>
                    )}
                  </div>
                </button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAction(vc.id)}
                  disabled={busy}
                  aria-busy={busy}
                  aria-label={addAriaLabel(vc.displayName)}
                  className="shrink-0"
                >
                  {busy ? (
                    <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  ) : (
                    <>
                      {actionIcon === 'add' ? (
                        <Plus aria-hidden="true" className="mr-1.5 size-4" />
                      ) : (
                        <Send aria-hidden="true" className="mr-1.5 size-4" />
                      )}
                      {actionLabel}
                    </>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
