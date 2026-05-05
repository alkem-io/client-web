import type { ReactNode } from 'react';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';

export type UserProfileSidebarProps = {
  bio: string | null;
  /**
   * Pre-rendered organisation cards. Lazy fetching per organisation lives in
   * the integration layer (each card is a `useAssociatedOrganization` consumer
   * that produces a `CompactContributorCard`). The view just renders the slot.
   */
  organizationsSlot: ReactNode | ReactNode[];
  /** True when there are no organisations to render — drives the empty-state. */
  organizationsEmpty: boolean;
  labels: {
    aboutTitle: string;
    organizationsTitle: string;
    emptyBio: string;
    emptyOrganizations: string;
  };
};

export function UserProfileSidebar({ bio, organizationsSlot, organizationsEmpty, labels }: UserProfileSidebarProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-section-title mb-4 flex items-center gap-2">{labels.aboutTitle}</h2>
        {bio ? <MarkdownContent content={bio} /> : <p className="text-body text-muted-foreground">{labels.emptyBio}</p>}
      </section>

      <section>
        <h2 className="text-section-title mb-4 flex items-center gap-2">{labels.organizationsTitle}</h2>
        {organizationsEmpty ? (
          <p className="text-body text-muted-foreground">{labels.emptyOrganizations}</p>
        ) : (
          <div className="flex flex-col gap-3">{organizationsSlot}</div>
        )}
      </section>
    </div>
  );
}
