import { ExternalLink, Lock } from 'lucide-react';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { Button } from '@/crd/primitives/button';
import { Card, CardContent } from '@/crd/primitives/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/crd/primitives/tooltip';

export type SpaceProfileSummary = {
  id: string;
  url: string;
  displayName: string;
  level: 'L0' | 'L1' | 'L2';
  avatarImageUrl: string | null;
};

export type BodyOfKnowledge =
  | {
      kind: 'space';
      spaceProfile: SpaceProfileSummary;
      hasReadAccess: boolean;
      description: string | null;
      vcDisplayName: string;
      spaceContextDescription: string;
    }
  | {
      kind: 'knowledgeBase';
      description: string;
      hasReadAccess: boolean;
      visitUrl: string;
    }
  | {
      kind: 'external';
      description: string;
    };

export type VCBodyOfKnowledgeSectionProps = {
  bodyOfKnowledge: BodyOfKnowledge | null;
  labels: {
    title: string;
    privateTooltip: string;
    visitButton: string;
  };
};

export function VCBodyOfKnowledgeSection({ bodyOfKnowledge, labels }: VCBodyOfKnowledgeSectionProps) {
  if (!bodyOfKnowledge) return null;

  return (
    <section>
      <h3 className="text-section-title mb-3">{labels.title}</h3>
      {bodyOfKnowledge.kind === 'space' ? (
        <SpaceBoK bok={bodyOfKnowledge} />
      ) : bodyOfKnowledge.kind === 'knowledgeBase' ? (
        <KnowledgeBaseBoK bok={bodyOfKnowledge} labels={labels} />
      ) : (
        <ExternalBoK bok={bodyOfKnowledge} />
      )}
    </section>
  );
}

function SpaceBoK({ bok }: { bok: Extract<BodyOfKnowledge, { kind: 'space' }> }) {
  const color = pickColorFromId(bok.spaceProfile.id || bok.spaceProfile.displayName);
  return (
    <div className="space-y-3">
      {bok.description ? <MarkdownContent content={bok.description} /> : null}
      <p className="text-caption text-muted-foreground">{bok.spaceContextDescription}</p>
      <Card>
        <CardContent className="p-3 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-md shrink-0 flex items-center justify-center text-white text-badge"
            style={backgroundGradient(color)}
          >
            {bok.spaceProfile.displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {bok.spaceProfile.url ? (
              <a
                href={bok.spaceProfile.url}
                className="text-card-title hover:underline truncate block rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {bok.spaceProfile.displayName}
              </a>
            ) : (
              <div className="text-card-title flex items-center gap-2 text-muted-foreground">
                <Lock className="w-3.5 h-3.5" />
                {bok.spaceProfile.displayName}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KnowledgeBaseBoK({
  bok,
  labels,
}: {
  bok: Extract<BodyOfKnowledge, { kind: 'knowledgeBase' }>;
  labels: VCBodyOfKnowledgeSectionProps['labels'];
}) {
  return (
    <div className="space-y-3">
      <MarkdownContent content={bok.description} />
      {bok.hasReadAccess ? (
        <Button variant="outline" size="sm" asChild={true}>
          <a href={bok.visitUrl}>
            {labels.visitButton}
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild={true}>
              <span>
                <Button variant="outline" size="sm" disabled={true}>
                  {labels.visitButton}
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{labels.privateTooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

function ExternalBoK({ bok }: { bok: Extract<BodyOfKnowledge, { kind: 'external' }> }) {
  return <p className="text-body text-muted-foreground">{bok.description}</p>;
}
