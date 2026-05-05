import { hasSocialReferences, SocialLinks } from '@/crd/components/common/SocialLinks';
import type { ReferenceLink } from '@/crd/components/organization/OrganizationProfileSidebar';
import { Card, CardContent, CardHeader } from '@/crd/primitives/card';

export type ModelCardSummary = {
  aiEngine: {
    name: string;
    isExternal: boolean;
    hostingLocation: string;
    isUsingOpenWeightsModel: boolean;
    canAccessWebWhenAnswering: boolean;
    additionalTechnicalDetails: string | null;
  };
  monitoring: {
    isUsageMonitoredByAlkemio: boolean;
  };
};

export type VCContentViewProps = {
  modelCard: ModelCardSummary;
  /**
   * ALL references — passed straight to `<SocialLinks>`, which filters
   * internally to the social subset and brand-resolves the icon. Same
   * one-source-of-truth contract used on the Organization sidebar.
   */
  references: ReferenceLink[];
  labels: {
    modelCardTitle: string;
    aiEngineLabel: string;
    aiEngineExternal: string;
    socialLinksTitle: string;
    socialLinksEmpty: string;
  };
};

export function VCContentView({ modelCard, references, labels }: VCContentViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-section-title">{labels.modelCardTitle}</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-label uppercase text-muted-foreground mb-1">{labels.aiEngineLabel}</div>
            <p className="text-body">
              <span className="text-body-emphasis">{modelCard.aiEngine.name}</span>
              {modelCard.aiEngine.isExternal ? (
                <span className="text-muted-foreground"> · {labels.aiEngineExternal}</span>
              ) : null}
            </p>
            {modelCard.aiEngine.hostingLocation ? (
              <p className="text-caption text-muted-foreground mt-1">{modelCard.aiEngine.hostingLocation}</p>
            ) : null}
            {modelCard.aiEngine.additionalTechnicalDetails ? (
              <p className="text-body text-muted-foreground mt-2">{modelCard.aiEngine.additionalTechnicalDetails}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-section-title">{labels.socialLinksTitle}</h2>
        </CardHeader>
        <CardContent>
          {hasSocialReferences(references) ? (
            <SocialLinks references={references} className="gap-4" />
          ) : (
            <p className="text-body text-muted-foreground">{labels.socialLinksEmpty}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
