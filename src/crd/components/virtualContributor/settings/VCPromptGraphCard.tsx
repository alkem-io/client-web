import { Lock, Plus, Trash2, Workflow } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldFooter } from '@/crd/components/common/FieldFooter';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/crd/primitives/accordion';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Switch } from '@/crd/primitives/switch';
import { Textarea } from '@/crd/primitives/textarea';
import type { VcPromptGraphCardProps, VcPromptGraphNode, VcPromptGraphProperty } from './VCPromptGraphCard.types';

/**
 * CRD prompt-graph (state-machine) editor. Renders the linear START→END node
 * sequence as an accordion: system nodes are read-only; user nodes expose an
 * editable prompt and an editable output-property table. Save / Reset live in
 * the footer; a platform-admin toggle gates whether editing is enabled.
 *
 * Replaces the legacy MUI `PromptGraphConfig`. Pure presentational — all data
 * and actions arrive via props.
 */
export function VCPromptGraphCard({
  nodes,
  onChangeNodePrompt,
  onChangeNodeProperties,
  onSave,
  onReset,
  dirty,
  status,
  editingEnabled,
  canTogglePlatformSetting,
  onToggleEditingEnabled,
  toggleSaving = false,
  labels,
}: VcPromptGraphCardProps) {
  const { t } = useTranslation('crd-contributorSettings');
  const [resetOpen, setResetOpen] = useState(false);

  const toggle = canTogglePlatformSetting ? (
    <span className="flex items-center gap-2 text-caption text-muted-foreground">
      {t('vc.promptGraph.editingEnabled')}
      <Switch
        checked={editingEnabled}
        onCheckedChange={next => onToggleEditingEnabled?.(next)}
        disabled={toggleSaving}
        aria-label={t('vc.promptGraph.editingEnabled')}
      />
    </span>
  ) : undefined;

  return (
    <SettingsCard
      icon={Workflow}
      title={t('vc.promptGraph.title')}
      description={t('vc.promptGraph.helper')}
      titleAccessory={toggle}
    >
      {!editingEnabled ? (
        <p className="text-body text-muted-foreground">{t('vc.promptGraph.disabled')}</p>
      ) : nodes.length === 0 ? (
        <p className="text-body text-muted-foreground">{t('vc.promptGraph.empty')}</p>
      ) : (
        <>
          <Accordion type="multiple" className="w-full">
            {nodes.map(node => (
              <NodeItem
                key={node.name}
                node={node}
                onChangePrompt={prompt => onChangeNodePrompt(node.name, prompt)}
                onChangeProperties={props => onChangeNodeProperties(node.name, props)}
              />
            ))}
          </Accordion>

          <div className="mt-4 flex items-center justify-between gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setResetOpen(true)}>
              {t('vc.promptGraph.reset')}
            </Button>
            <FieldFooter dirty={dirty} status={status} onSave={onSave} labels={labels} />
          </div>

          <ConfirmationDialog
            open={resetOpen}
            onOpenChange={setResetOpen}
            variant="destructive"
            title={t('vc.promptGraph.resetConfirm.title')}
            description={t('vc.promptGraph.resetConfirm.description')}
            confirmLabel={t('vc.promptGraph.reset')}
            onConfirm={() => {
              setResetOpen(false);
              onReset();
            }}
          />
        </>
      )}
    </SettingsCard>
  );
}

function NodeItem({
  node,
  onChangePrompt,
  onChangeProperties,
}: {
  node: VcPromptGraphNode;
  onChangePrompt: (prompt: string) => void;
  onChangeProperties: (properties: VcPromptGraphProperty[]) => void;
}) {
  const { t } = useTranslation('crd-contributorSettings');

  return (
    <AccordionItem value={node.name}>
      <AccordionTrigger className="text-body-emphasis">
        <span className="flex items-center gap-2">
          {node.system && <Lock aria-hidden="true" className="size-3.5 text-muted-foreground" />}
          {node.name}
        </span>
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        {node.inputVariables && node.inputVariables.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="uppercase text-label text-muted-foreground">{t('vc.promptGraph.inputVariables')}</span>
            {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
            {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
            <ul role="list" className="flex flex-wrap gap-1.5">
              {node.inputVariables.map(v => (
                <li key={v}>
                  <Badge variant="secondary" className="text-badge">
                    {v}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!node.system && (
          <div className="flex flex-col gap-1.5">
            <span className="uppercase text-label text-muted-foreground">{t('vc.promptGraph.prompt')}</span>
            <Textarea
              value={node.prompt ?? ''}
              onChange={e => onChangePrompt(e.target.value)}
              rows={8}
              aria-label={t('vc.promptGraph.prompt')}
            />
          </div>
        )}

        <PropertyEditor properties={node.outputProperties} readOnly={node.system} onChange={onChangeProperties} />
      </AccordionContent>
    </AccordionItem>
  );
}

function PropertyEditor({
  properties,
  readOnly,
  onChange,
}: {
  properties: VcPromptGraphProperty[];
  readOnly: boolean;
  onChange: (properties: VcPromptGraphProperty[]) => void;
}) {
  const { t } = useTranslation('crd-contributorSettings');

  const update = (index: number, patch: Partial<VcPromptGraphProperty>) => {
    onChange(properties.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };
  const remove = (index: number) => onChange(properties.filter((_, i) => i !== index));
  const add = () => onChange([...properties, { name: '', type: 'string', optional: false, description: '' }]);

  return (
    <div className="flex flex-col gap-2">
      <span className="uppercase text-label text-muted-foreground">{t('vc.promptGraph.properties.title')}</span>

      {properties.length === 0 ? (
        <p className="text-caption text-muted-foreground">{t('vc.promptGraph.properties.empty')}</p>
      ) : (
        // biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style
        // biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset
        <ul role="list" className="flex flex-col gap-2">
          {properties.map((prop, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: property rows have no stable id; index is the row identity
            <li key={index} className="rounded-lg border bg-card p-2">
              {readOnly ? (
                <div className="text-body">
                  <span className="text-body-emphasis">{prop.name || '—'}</span>{' '}
                  <span className="text-caption text-muted-foreground">
                    ({prop.type}
                    {prop.optional ? `, ${t('vc.promptGraph.properties.optional')}` : ''})
                  </span>
                  {prop.description && <p className="text-caption text-muted-foreground">{prop.description}</p>}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      value={prop.name}
                      onChange={e => update(index, { name: e.target.value })}
                      placeholder={t('vc.promptGraph.properties.name')}
                      aria-label={t('vc.promptGraph.properties.name')}
                      className="h-8 flex-1 min-w-[8rem] text-control"
                    />
                    <Input
                      value={prop.type}
                      onChange={e => update(index, { type: e.target.value })}
                      placeholder={t('vc.promptGraph.properties.type')}
                      aria-label={t('vc.promptGraph.properties.type')}
                      className="h-8 w-28 text-control"
                    />
                    <span className="flex items-center gap-1.5 text-caption text-muted-foreground">
                      <Switch
                        checked={prop.optional}
                        onCheckedChange={next => update(index, { optional: next })}
                        aria-label={t('vc.promptGraph.properties.optional')}
                      />
                      {t('vc.promptGraph.properties.optional')}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      aria-label={t('vc.promptGraph.properties.remove')}
                      className="shrink-0"
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </Button>
                  </div>
                  <Input
                    value={prop.description}
                    onChange={e => update(index, { description: e.target.value })}
                    placeholder={t('vc.promptGraph.properties.description')}
                    aria-label={t('vc.promptGraph.properties.description')}
                    className="h-8 text-control"
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {!readOnly && (
        <Button type="button" variant="outline" size="sm" onClick={add} className="self-start">
          <Plus aria-hidden="true" className="mr-1.5 size-4" />
          {t('vc.promptGraph.properties.add')}
        </Button>
      )}
    </div>
  );
}
