import { Globe, Link2 } from 'lucide-react';
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

export type SocialReferenceItem = {
  id: string;
  name: string;
  uri: string;
  brand: 'linkedin' | 'twitter' | 'github' | 'youtube' | 'generic';
};

export type VCContentViewProps = {
  modelCard: ModelCardSummary;
  socialReferences: SocialReferenceItem[];
  labels: {
    modelCardTitle: string;
    aiEngineLabel: string;
    aiEngineExternal: string;
    socialLinksTitle: string;
    socialLinksEmpty: string;
  };
};

// `lucide-react` no longer ships brand icons — fall back to a generic glyph.
const brandIcon = (brand: SocialReferenceItem['brand']) => (brand === 'generic' ? Globe : Link2);

export function VCContentView({ modelCard, socialReferences, labels }: VCContentViewProps) {
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
          {socialReferences.length === 0 ? (
            <p className="text-body text-muted-foreground">{labels.socialLinksEmpty}</p>
          ) : (
            <div className="flex items-center gap-4 flex-wrap">
              {socialReferences.map(s => {
                const Icon = brandIcon(s.brand);
                return (
                  <a
                    key={s.id}
                    href={s.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={s.name}
                    title={s.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
