type UserMenuRolesProps = {
  /** Platform role labels, most-privileged first (see `useCrdUser`). */
  roles: string[];
};

/**
 * The caption under the user's name in the avatar menu.
 *
 * Strongest role as the label, "+N" for the rest. The menu is 224px wide and
 * the labels are long ("Platform Content Full Access"), so listing every role
 * inline is not an option; the full precedence-ordered list is exposed through
 * `title` (hover) and a screen-reader-only expansion of the "+N" instead, so a
 * holder of several roles is never silently collapsed to one.
 */
export function UserMenuRoles({ roles }: UserMenuRolesProps) {
  if (roles.length === 0) return null;

  const [strongest, ...rest] = roles;
  const all = rest.length > 0 ? roles.join(', ') : undefined;

  return (
    <span className="text-label uppercase text-muted-foreground" title={all}>
      {strongest}
      {rest.length > 0 && (
        <>
          <span aria-hidden="true" className="ml-1 normal-case text-muted-foreground/70">
            +{rest.length}
          </span>
          <span className="sr-only">, {rest.join(', ')}</span>
        </>
      )}
    </span>
  );
}
