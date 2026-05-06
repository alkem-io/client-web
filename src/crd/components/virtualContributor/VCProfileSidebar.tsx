import {
  CompactContributorCard,
  type CompactContributorCardItem,
} from '@/crd/components/common/CompactContributorCard';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { excludeSocialReferences } from '@/crd/components/common/SocialLinks';
import { VCBodyOfKnowledgeSection, type VCBodyOfKnowledgeSectionProps } from './VCBodyOfKnowledgeSection';

export type ReferenceLink = {
  id: string;
  name: string;
  uri: string;
  description: string | null;
};

export type VCProfileSidebarProps = {
  description: string | null;
  /** Provider compact card. `null` when the VC has no provider. */
  host: CompactContributorCardItem | null;
  /**
   * ALL references (social + non-social). The view filters via
   * `excludeSocialReferences` for the References section. Social links live
   * in the right-column content view, not the sidebar.
   */
  references: ReferenceLink[];
  bodyOfKnowledge: VCBodyOfKnowledgeSectionProps['bodyOfKnowledge'];
  labels: {
    descriptionTitle: string;
    hostTitle: string;
    hostEmpty: string;
    referencesTitle: string;
    referencesEmpty: string;
    bodyOfKnowledgeTitle: string;
    bodyOfKnowledgePrivateTooltip: string;
    bodyOfKnowledgeVisitButton: string;
  };
};

export function VCProfileSidebar({ description, host, references, bodyOfKnowledge, labels }: VCProfileSidebarProps) {
  const nonSocialReferences = excludeSocialReferences(references);
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-section-title mb-3">{labels.descriptionTitle}</h2>
        {description ? <MarkdownContent content={description} /> : <p className="text-body text-muted-foreground">—</p>}
      </section>

      <section>
        <h2 className="text-section-title mb-3">{labels.hostTitle}</h2>
        {host ? (
          <CompactContributorCard {...host} />
        ) : (
          <p className="text-body text-muted-foreground">{labels.hostEmpty}</p>
        )}
      </section>

      <section>
        <h2 className="text-section-title mb-3">{labels.referencesTitle}</h2>
        {nonSocialReferences.length === 0 ? (
          <p className="text-body text-muted-foreground">{labels.referencesEmpty}</p>
        ) : (
          /* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */
          /* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */
          <ul role="list" className="space-y-2">
            {nonSocialReferences.map(ref => (
              <li key={ref.id}>
                <a
                  href={ref.uri}
                  target="_blank"
                  rel="noreferrer"
                  className="text-body-emphasis text-primary hover:underline rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {ref.name}
                </a>
                {ref.description ? <p className="text-caption text-muted-foreground">{ref.description}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <VCBodyOfKnowledgeSection
        bodyOfKnowledge={bodyOfKnowledge}
        labels={{
          title: labels.bodyOfKnowledgeTitle,
          privateTooltip: labels.bodyOfKnowledgePrivateTooltip,
          visitButton: labels.bodyOfKnowledgeVisitButton,
        }}
      />
    </div>
  );
}
