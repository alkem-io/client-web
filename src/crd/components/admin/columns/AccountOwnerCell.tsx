/**
 * Renders the "Account Owner" column — plain muted text mirroring the MUI
 * `AccountOwnerColumn`.
 */
export function AccountOwnerCell({ owner }: { owner: string }) {
  return <span className="text-body text-muted-foreground break-words">{owner}</span>;
}
