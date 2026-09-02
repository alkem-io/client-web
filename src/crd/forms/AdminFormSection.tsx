import type { ReactNode } from 'react';

/**
 * Bordered, titled section used to group fields in the admin create/edit forms
 * (organization, user). Shared so the section chrome stays consistent.
 */
export function AdminFormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <h2 className="text-section-title">{title}</h2>
      {children}
    </section>
  );
}
