import {
  FileText,
  Image as ImageIcon,
  Lock,
  Megaphone,
  MessageSquareText,
  Presentation,
  StickyNote,
  Users,
  Vote,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/crd/primitives/accordion';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import type { FramingKind, TemplateContent } from '../types';

type SpaceContent = Extract<TemplateContent, { type: 'space' }>;

/** Per-framing-kind icon — mirrors the legacy MUI per-callout icon in `InnovationFlowCalloutsPreview`. */
const FRAMING_ICON: Record<FramingKind, ComponentType<SVGProps<SVGSVGElement>>> = {
  none: MessageSquareText,
  whiteboard: Presentation,
  memo: StickyNote,
  document: FileText,
  cta: Megaphone,
  image: ImageIcon,
  poll: Vote,
  contributors: Users,
};

/**
 * Read-only preview of a Space template's captured structure. Mirrors the legacy MUI
 * `TemplateContentSpacePreview`: the innovation-flow phases render as a selectable chip strip; the
 * selected phase shows its description plus the callouts that belong to that flow state (as an
 * expandable accordion). A "this template also includes these subspaces" section renders below.
 */
export function SpaceTemplatePreview({ content }: { content: SpaceContent }) {
  const { t } = useTranslation('crd-templates');
  const [selectedPhase, setSelectedPhase] = useState<string | undefined>(content.phases[0]?.name);

  // Guard against a stale selection if the captured structure changes (e.g. the user picks a
  // different source space): fall back to the first phase when the selected one is gone.
  const activePhase =
    selectedPhase && content.phases.some(p => p.name === selectedPhase) ? selectedPhase : content.phases[0]?.name;

  const activePhaseDescription = content.phases.find(p => p.name === activePhase)?.description;
  const phaseCallouts = content.starterCallouts.filter(c => c.flowStateName === activePhase);

  return (
    <div className="space-y-4">
      {content.phases.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {content.phases.map((phase, i) => {
            // Phase names aren't guaranteed unique, so compose a stable key with the index
            // (read-only list, never reordered).
            const key = `${phase.name}-${i}`;
            return (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={phase.name === activePhase ? 'default' : 'outline'}
                onClick={() => setSelectedPhase(phase.name)}
              >
                {phase.name}
              </Button>
            );
          })}
        </div>
      )}

      {activePhaseDescription && <MarkdownContent content={activePhaseDescription} className="text-caption" />}

      {content.phases.length > 0 &&
        (phaseCallouts.length > 0 ? (
          <Accordion type="single" collapsible={true} className="space-y-2">
            {phaseCallouts.map((callout, i) => {
              const Icon = FRAMING_ICON[callout.framingKind];
              const value = `${callout.name}-${i}`;
              return (
                <AccordionItem key={value} value={value} className="border rounded-lg bg-card px-4 last:border-b">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <span className="flex items-center gap-2 text-control text-left">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon aria-hidden="true" className="size-4" />
                      </span>
                      {callout.name}
                      <Badge variant="outline" className="text-badge">
                        {t(`framingKind.${callout.framingKind}`)}
                      </Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-0">
                    {callout.description ? (
                      <MarkdownContent content={callout.description} />
                    ) : (
                      <p className="text-caption text-muted-foreground">{t('preview.space.noDescription')}</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <p className="text-body text-muted-foreground">{t('preview.space.noCallouts')}</p>
        ))}

      {content.subspaceTemplates.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-body-emphasis">{t('preview.space.includesSubspaces')}</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {content.subspaceTemplates.map(sub => (
              <li key={sub.id} className="overflow-hidden rounded-lg border bg-card">
                <div className="aspect-video bg-muted">
                  {sub.bannerUrl && <img src={sub.bannerUrl} alt="" className="size-full object-cover" />}
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2">
                  <span className="truncate text-control">{sub.name}</span>
                  {sub.isPrivate && (
                    <Lock
                      aria-label={t('preview.space.privateSubspace')}
                      className="size-3.5 shrink-0 text-muted-foreground"
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.phases.length === 0 && content.subspaceTemplates.length === 0 && (
        <p className="text-body text-muted-foreground">{t('preview.space.none')}</p>
      )}
    </div>
  );
}
