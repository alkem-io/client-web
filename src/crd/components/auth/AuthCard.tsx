import type { ReactNode } from 'react';

export type AuthCardProps = {
  /** Hero title rendered inside the card (always shown). */
  title: ReactNode;
  /** Optional header slot — typically an `AuthCardHeader` with the cross-link. */
  header?: ReactNode;
  children: ReactNode;
};

/**
 * Shared shell for every auth-flow card (login, sign-up, recovery, settings,
 * verification, error, verification-reminder). Wraps the rounded-card +
 * elevated-shadow background, the optional header slot, and the hero title so
 * each consumer only declares its own body content.
 */
export function AuthCard({ title, header, children }: AuthCardProps) {
  return (
    <div className="rounded-lg bg-card px-9 py-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      {header ? <div className="mb-6">{header}</div> : null}
      <h1 className="text-hero mb-6 text-foreground">{title}</h1>
      {children}
    </div>
  );
}
