import { Building2, X } from 'lucide-react';
import { Button } from '@/crd/primitives/button';

export type PendingOrganizationInvitationItem = {
  id: string;
  organizationDisplayName: string;
  organizationUrl?: string;
  /** Pre-translated role text ("Member" / "Member + Lead"). */
  roleLabel: string;
  /** Pre-formatted date string. */
  date: string;
  canRevoke: boolean;
};

export type PendingOrganizationInvitationsListProps = {
  title: string;
  items: PendingOrganizationInvitationItem[];
  emptyLabel: string;
  roleColumnLabel: string;
  dateColumnLabel: string;
  revokeLabel: string;
  revokeAriaLabel: (name: string) => string;
  onRevoke: (id: string) => void;
  className?: string;
};

/**
 * Small list of an inviting Space's currently-open organization invitations,
 * shown under the Member Organisations table. Mirrors the pending list
 * pattern used elsewhere in space settings, scoped to organization invitees.
 */
export function PendingOrganizationInvitationsList({
  title,
  items,
  emptyLabel,
  roleColumnLabel,
  dateColumnLabel,
  revokeLabel,
  revokeAriaLabel,
  onRevoke,
  className,
}: PendingOrganizationInvitationsListProps) {
  return (
    <div className={className}>
      <h4 className="text-body-emphasis mb-2">{title}</h4>
      {items.length === 0 ? (
        <p className="text-caption text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="rounded-lg border bg-card divide-y divide-border">
          {items.map(item => (
            <li key={item.id} className="flex items-center justify-between gap-3 p-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
                  aria-hidden="true"
                >
                  <Building2 className="size-4" />
                </span>
                <div className="min-w-0">
                  {item.organizationUrl ? (
                    <a href={item.organizationUrl} className="block text-body-emphasis truncate hover:underline">
                      {item.organizationDisplayName}
                    </a>
                  ) : (
                    <span className="block text-body-emphasis truncate">{item.organizationDisplayName}</span>
                  )}
                  <span className="block text-caption text-muted-foreground truncate">
                    {roleColumnLabel}: {item.roleLabel} · {dateColumnLabel}: {item.date}
                  </span>
                </div>
              </div>
              {item.canRevoke && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={() => onRevoke(item.id)}
                  aria-label={revokeAriaLabel(item.organizationDisplayName)}
                >
                  <X aria-hidden="true" className="size-3.5" />
                  {revokeLabel}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
