import { ExternalLink, Globe, Info, Key, MessageSquare, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type SectionSaveStatus, FieldFooter as SharedFieldFooter } from '@/crd/components/common/FieldFooter';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { RadioGroup, RadioGroupItem } from '@/crd/primitives/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';
import { Separator } from '@/crd/primitives/separator';
import { Skeleton } from '@/crd/primitives/skeleton';
import { Switch } from '@/crd/primitives/switch';
import type {
  VcBodyOfKnowledgeCardProps,
  VcExternalConfigCardProps,
  VcPromptCardProps,
  VcPromptGraphFallbackProps,
  VcSearchVisibility,
  VcSettingsViewProps,
  VcVisibilityCardProps,
} from './VCSettingsTabView.types';

type SectionLabels = {
  save: string;
  saving: string;
  saved: string;
  retry: string;
};

type FFProps = {
  hint?: string;
  dirty: boolean;
  status: SectionSaveStatus;
  onSave: () => void;
  labels: SectionLabels;
};

const FF = (p: FFProps) => (
  <SharedFieldFooter hint={p.hint} dirty={p.dirty} status={p.status} onSave={p.onSave} labels={p.labels} />
);

export function VCSettingsTabView(props: VcSettingsViewProps) {
  const { t } = useTranslation('crd-contributorSettings');

  if (props.loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const labels: SectionLabels = {
    save: t('shared.save'),
    saving: t('shared.saving'),
    saved: t('shared.saved'),
    retry: t('shared.save'),
  };

  return (
    <div className="space-y-6">
      <VCVisibilityCard {...props.visibility} />
      {props.bodyOfKnowledge ? <VCBodyOfKnowledgeCard {...props.bodyOfKnowledge} /> : null}
      {props.prompt ? <VCPromptCard {...props.prompt} labels={labels} /> : null}
      {props.externalConfig ? <VCExternalConfigCard {...props.externalConfig} labels={labels} /> : null}
      {props.promptGraphFallback ? <VCPromptGraphFallbackCard {...props.promptGraphFallback} /> : null}
    </div>
  );
}

// ────────────────── Sub-section cards ──────────────────

function VCVisibilityCard(p: VcVisibilityCardProps) {
  const { t } = useTranslation('crd-contributorSettings');
  const onValueChange = (value: string) => p.onChangeSearchVisibility(value as VcSearchVisibility);
  const listedDisabled = p.searchVisibility !== 'public' || p.listedInStoreSaving;
  return (
    <SettingsCard icon={Globe} title={t('vc.visibility.title')} description={t('vc.visibility.helper')}>
      <RadioGroup value={p.searchVisibility} onValueChange={onValueChange} aria-busy={p.searchVisibilitySaving}>
        <RadioOption
          value="public"
          label={t('vc.visibility.publicLabel')}
          description={t('vc.visibility.publicDescription')}
        />
        <RadioOption
          value="account"
          label={t('vc.visibility.accountLabel')}
          description={t('vc.visibility.accountDescription')}
        />
        <RadioOption
          value="hidden"
          label={t('vc.visibility.hiddenLabel')}
          description={t('vc.visibility.hiddenDescription')}
        />
      </RadioGroup>

      <Separator className="my-4 opacity-50" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <Label className="text-card-title">{t('vc.visibility.listedInStoreLabel')}</Label>
          <p className="mt-1 text-caption text-muted-foreground">{t('vc.visibility.listedInStoreHelper')}</p>
        </div>
        <Switch
          checked={p.listedInStore}
          disabled={listedDisabled}
          aria-busy={p.listedInStoreSaving}
          onCheckedChange={p.onToggleListedInStore}
          aria-label={t('vc.visibility.listedInStoreLabel')}
        />
      </div>
    </SettingsCard>
  );
}

function RadioOption({ value, label, description }: { value: string; label: string; description: string }) {
  const id = `vc-visibility-${value}`;
  return (
    <div className="flex items-start gap-3">
      <RadioGroupItem value={value} id={id} className="mt-0.5" />
      <Label htmlFor={id} className="flex-1 cursor-pointer">
        <span className="text-card-title">{label}</span>
        <p className="mt-0.5 text-caption text-muted-foreground">{description}</p>
      </Label>
    </div>
  );
}

function VCBodyOfKnowledgeCard(p: VcBodyOfKnowledgeCardProps) {
  const { t } = useTranslation('crd-contributorSettings');
  return (
    <SettingsCard icon={Info} title={t('vc.bodyOfKnowledge.title')} description={t('vc.bodyOfKnowledge.helper')}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <Label className="text-card-title">{t('vc.bodyOfKnowledge.privacyToggleLabel')}</Label>
          <p className="mt-1 text-caption text-muted-foreground">{t('vc.bodyOfKnowledge.privacyToggleHelper')}</p>
        </div>
        <Switch
          checked={p.contentVisible}
          disabled={p.contentVisibleSaving}
          aria-busy={p.contentVisibleSaving}
          onCheckedChange={p.onToggleContentVisible}
          aria-label={t('vc.bodyOfKnowledge.privacyToggleLabel')}
        />
      </div>

      <Separator className="my-4 opacity-50" />

      <div className="flex items-center justify-between gap-4">
        <p className="text-caption text-muted-foreground">
          {t('vc.bodyOfKnowledge.lastUpdated')}{' '}
          <span className="text-foreground">
            {p.lastUpdatedIso ? new Date(p.lastUpdatedIso).toLocaleString() : t('vc.bodyOfKnowledge.never')}
          </span>
        </p>
        <Button type="button" variant="outline" onClick={p.onRefresh} disabled={p.refreshing} aria-busy={p.refreshing}>
          <RefreshCcw aria-hidden="true" className="mr-2 size-4" />
          {p.refreshing ? t('shared.saving') : p.refreshLabel}
        </Button>
      </div>
    </SettingsCard>
  );
}

function VCPromptCard(p: VcPromptCardProps & { labels: SectionLabels }) {
  const { t } = useTranslation('crd-contributorSettings');
  return (
    <SettingsCard icon={MessageSquare} title={t('vc.prompt.title')} description={p.helpText}>
      <MarkdownEditor value={p.value} onChange={p.onChange} />
      <FF dirty={p.dirty} status={p.status} onSave={p.onSave} labels={p.labels} />
    </SettingsCard>
  );
}

function VCExternalConfigCard(p: VcExternalConfigCardProps & { labels: SectionLabels }) {
  const { t } = useTranslation('crd-contributorSettings');
  return (
    <SettingsCard icon={Key} title={t('vc.externalConfig.title')} description={t('vc.externalConfig.helper')}>
      <div>
        <Label className="text-card-title" htmlFor="vc-api-key">
          {t('vc.externalConfig.apiKeyLabel')}
        </Label>
        <Input
          id="vc-api-key"
          type="password"
          value={p.apiKey}
          onChange={e => p.onChangeApiKey(e.target.value)}
          placeholder={t('vc.externalConfig.apiKeyPlaceholder')}
          className="mt-2"
          aria-label={t('vc.externalConfig.apiKeyLabel')}
        />
        <p className="mt-1 text-caption text-muted-foreground">{t('vc.externalConfig.apiKeyHelper')}</p>
      </div>

      {p.engine === 'openaiAssistant' && p.assistantId !== undefined && p.onChangeAssistantId ? (
        <div className="mt-4">
          <Label className="text-card-title" htmlFor="vc-assistant-id">
            {t('vc.externalConfig.assistantIdLabel')}
          </Label>
          <Input
            id="vc-assistant-id"
            value={p.assistantId}
            onChange={e => p.onChangeAssistantId?.(e.target.value)}
            className="mt-2"
            aria-label={t('vc.externalConfig.assistantIdLabel')}
          />
        </div>
      ) : null}

      <div className="mt-4">
        <Label className="text-card-title" htmlFor="vc-model">
          {t('vc.externalConfig.modelLabel')}
        </Label>
        <Select value={p.modelValue} onValueChange={p.onChangeModel}>
          <SelectTrigger id="vc-model" className="mt-2 w-full" aria-label={t('vc.externalConfig.modelLabel')}>
            <SelectValue placeholder={t('vc.externalConfig.modelLabel')} />
          </SelectTrigger>
          <SelectContent>
            {p.modelOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <FF dirty={p.dirty} status={p.status} onSave={p.onSave} labels={p.labels} />
    </SettingsCard>
  );
}

function VCPromptGraphFallbackCard(p: VcPromptGraphFallbackProps) {
  return (
    <SettingsCard icon={Info} title={p.heading}>
      <p className="text-body text-muted-foreground">{p.description}</p>
      <div className="mt-4">
        <Button asChild={true} variant="outline">
          <a href={p.legacyHref} target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" className="mr-2 size-4" />
            {p.ctaLabel}
          </a>
        </Button>
      </div>
    </SettingsCard>
  );
}
