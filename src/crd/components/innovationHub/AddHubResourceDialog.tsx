import { Loader2, Plus } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/crd/primitives/tabs';

export type HubResourceCandidate = {
  id: string;
  displayName: string;
  /** Short descriptive line (e.g. the profile tagline). */
  description?: string;
  avatarUrl?: string;
};

export type AddHubResourceDialogLabels = {
  title: string;
  description: string;
  candidatesTab: string;
  urlTab: string;
  /** Empty state of the candidates tab — shown only inside the dialog, never on the public page. */
  candidatesEmpty: string;
  candidatesLoading: string;
  /** aria-label of the candidates list. */
  candidatesAria: string;
  /** The per-card "Add to the Innovation Hub" action. */
  addToHub: string;
  close: string;
};

export type AddHubResourceDialogProps = {
  open: boolean;
  /** Called with `false` for every close affordance (Esc, overlay, X, Close button). */
  onOpenChange: (open: boolean) => void;
  labels: AddHubResourceDialogLabels;
  /** Account resources of this type not yet on the hub's list — already deduplicated by the consumer. */
  candidates: HubResourceCandidate[];
  candidatesLoading?: boolean;
  onAddCandidate: (id: string) => void;
  /** Disables the add buttons while a mutation is in flight. */
  busy?: boolean;
  /**
   * The add-by-URL form — an integration-layer slot (URL resolution and list
   * updates need Apollo, which never lives in CRD). Slot pattern per the CRD
   * ShareDialog convention.
   */
  urlTabSlot: ReactNode;
};

type TabKey = 'candidates' | 'url';

/**
 * Uniform two-tab "Add …" dialog used by all three Innovation Hub curation
 * tabs (Spaces / Innovation Packs / Virtual Contributors — FR-016/FR-017):
 * tab 1 lists the account's candidate resources as cards with an
 * "Add to the Innovation Hub" button; tab 2 hosts the add-by-URL form and is
 * selected by default when tab 1 has nothing to offer.
 */
export function AddHubResourceDialog({
  open,
  onOpenChange,
  labels,
  candidates,
  candidatesLoading = false,
  onAddCandidate,
  busy = false,
  urlTabSlot,
}: AddHubResourceDialogProps) {
  // Default-tab rule: URL tab when there are no candidates (FR-016), unless the
  // user explicitly picked a tab. `null` = no explicit choice yet; reset on close.
  const [selectedTab, setSelectedTab] = useState<TabKey | null>(null);
  const activeTab: TabKey = selectedTab ?? (candidates.length > 0 || candidatesLoading ? 'candidates' : 'url');

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelectedTab(null);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col overflow-hidden sm:max-w-[560px]">
        <DialogHeader className="shrink-0">
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={value => setSelectedTab(value as TabKey)}
          className="flex-1 min-h-0 flex flex-col gap-3"
        >
          <TabsList className="w-full shrink-0">
            <TabsTrigger value="candidates">{labels.candidatesTab}</TabsTrigger>
            <TabsTrigger value="url">{labels.urlTab}</TabsTrigger>
          </TabsList>

          <TabsContent value="candidates" className="min-h-0 overflow-y-auto">
            {candidatesLoading ? (
              <output
                aria-label={labels.candidatesLoading}
                className="flex items-center justify-center gap-2 py-8 text-muted-foreground"
              >
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                <span className="text-body">{labels.candidatesLoading}</span>
              </output>
            ) : candidates.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                <p className="text-body text-muted-foreground">{labels.candidatesEmpty}</p>
              </div>
            ) : (
              // biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight strips list semantics; the role restores them
              // biome-ignore lint/a11y/useSemanticElements: the <ul> IS the semantic element — the role is reaffirming, not substituting
              <ul role="list" aria-label={labels.candidatesAria} className="flex flex-col gap-2 list-none p-0 m-0">
                {candidates.map(candidate => (
                  <li key={candidate.id}>
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                      <Avatar className="size-9 rounded-md shrink-0">
                        {candidate.avatarUrl ? <AvatarImage src={candidate.avatarUrl} alt="" /> : null}
                        <AvatarFallback className="bg-primary/10 text-primary rounded-md text-badge">
                          {candidate.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-card-title truncate text-foreground">{candidate.displayName}</p>
                        {candidate.description ? (
                          <p className="text-caption truncate text-muted-foreground">{candidate.description}</p>
                        ) : null}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-1.5"
                        onClick={() => onAddCandidate(candidate.id)}
                        disabled={busy}
                        aria-busy={busy}
                      >
                        <Plus aria-hidden="true" className="size-3.5" />
                        {labels.addToHub}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="url" className="min-h-0 overflow-y-auto">
            {urlTabSlot}
          </TabsContent>
        </Tabs>

        <DialogFooter className="shrink-0">
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
            {labels.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
