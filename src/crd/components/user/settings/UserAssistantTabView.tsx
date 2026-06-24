import { Info, Pencil, Search, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/crd/primitives/card';
import { Skeleton } from '@/crd/primitives/skeleton';
import { Switch } from '@/crd/primitives/switch';

const NS = 'crd-contributorSettings';

/**
 * Plain (non-GraphQL) capability kinds. Mirrors the server
 * `AssistantCapabilityKind` enum but stays a plain string union so this CRD
 * component imports no generated types (CRD golden rule #4).
 */
export type AssistantCapabilityKindValue = 'READ' | 'WRITE_ADDITIVE' | 'WRITE_DESTRUCTIVE';

export type AssistantCapabilityRowData = {
  /** MCP tool name — stable id used as the toggle key + mutation key. */
  name: string;
  displayName: string;
  description: string;
  kind: AssistantCapabilityKindValue;
  /** True for WRITE_ADDITIVE / WRITE_DESTRUCTIVE (content-changing). */
  isWrite: boolean;
  enabled: boolean;
};

export type UserAssistantTabViewProps = {
  loading: boolean;
  capabilities: AssistantCapabilityRowData[];
  /** Called when a capability switch flips. Consumer persists + reverts on error. */
  onToggle: (capabilityName: string, next: boolean) => void;
};

/**
 * User → Settings → Assistant tab — presentational view.
 *
 * Renders one Switch per capability **enumerated by the consumer** from the
 * server's `platformCapabilities` query (FR-006 / FR-018) — this component holds
 * no capability list of its own. Read capabilities and write capabilities are
 * grouped so the read-only default ("reads on, writes off") is legible. The
 * component never fetches or mutates; all data + behaviour arrive via props.
 */
export function UserAssistantTabView({ loading, capabilities, onToggle }: UserAssistantTabViewProps) {
  const { t } = useTranslation(NS);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const readCapabilities = capabilities.filter(capability => !capability.isWrite);
  const writeCapabilities = capabilities.filter(capability => capability.isWrite);

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-4 text-body text-muted-foreground">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>{t('user.assistant.helpBanner')}</p>
      </div>

      {capabilities.length === 0 ? (
        <Card className="bg-muted/30 p-4">
          <div className="flex items-start gap-2 text-body text-muted-foreground">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>{t('user.assistant.empty')}</p>
          </div>
        </Card>
      ) : (
        <>
          <CapabilityGroup
            title={t('user.assistant.groups.read.title')}
            description={t('user.assistant.groups.read.description')}
            Icon={Search}
            capabilities={readCapabilities}
            onToggle={onToggle}
          />
          <CapabilityGroup
            title={t('user.assistant.groups.write.title')}
            description={t('user.assistant.groups.write.description')}
            Icon={Pencil}
            capabilities={writeCapabilities}
            onToggle={onToggle}
          />
        </>
      )}
    </div>
  );
}

function CapabilityGroup({
  title,
  description,
  Icon,
  capabilities,
  onToggle,
}: {
  title: string;
  description: string;
  Icon: typeof Search;
  capabilities: AssistantCapabilityRowData[];
  onToggle: (capabilityName: string, next: boolean) => void;
}) {
  const { t } = useTranslation(NS);

  if (capabilities.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-start gap-2">
        <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="flex flex-col gap-1">
          <h2 className="text-section-title">{title}</h2>
          <p className="text-body text-muted-foreground">{description}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <ul>
            {capabilities.map(capability => (
              <li
                key={capability.name}
                className="flex flex-col gap-4 border-b border-border/50 p-4 last:border-b-0 md:flex-row md:items-center md:justify-between md:px-6"
              >
                <div className="flex flex-1 flex-col gap-1 pr-4">
                  <div className="flex items-center gap-2">
                    <p className="text-body-emphasis leading-normal">{capability.displayName}</p>
                    {capability.kind === 'WRITE_DESTRUCTIVE' ? (
                      <span className="inline-flex items-center gap-1 text-caption text-destructive">
                        <ShieldAlert aria-hidden="true" className="size-3" />
                        {t('user.assistant.destructiveBadge')}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-caption text-muted-foreground">{capability.description}</p>
                </div>
                <Switch
                  checked={capability.enabled}
                  onCheckedChange={next => onToggle(capability.name, next)}
                  aria-label={t('user.assistant.toggleAria', { capability: capability.displayName })}
                />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
