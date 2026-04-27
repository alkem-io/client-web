import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';

type CrdSubspaceIndexDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calloutsSetId: string | undefined;
};

export function CrdSubspaceIndexDialogConnector({
  open,
  onOpenChange,
  calloutsSetId,
}: CrdSubspaceIndexDialogConnectorProps) {
  const { t } = useTranslation('crd-subspace');

  const { callouts, loading } = useCalloutsSet({
    calloutsSetId,
    classificationTagsets: [],
    includeClassification: true,
    skip: !open || !calloutsSetId,
  });

  // Group by flow state (phase). Items without a flow state fall under "—".
  const groups = (() => {
    const map = new Map<string, typeof callouts>();
    (callouts ?? []).forEach(c => {
      const state = c.classification?.flowState?.tags?.[0] ?? '—';
      const arr = map.get(state) ?? [];
      arr.push(c);
      map.set(state, arr);
    });
    return Array.from(map.entries()).map(([state, items]) => ({
      state,
      items: [...(items ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    }));
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto" closeLabel={t('a11y.close')}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
            {t('index.dialogTitle')}
          </DialogTitle>
        </DialogHeader>

        {loading && groups.length === 0 && <p className="text-body text-muted-foreground py-6">…</p>}

        {!loading && groups.length === 0 && (
          <DialogDescription className="py-6 text-center">{t('index.empty')}</DialogDescription>
        )}

        <div className="space-y-6 mt-2">
          {groups.map(group => (
            <section key={group.state}>
              <p className="text-label uppercase text-muted-foreground mb-2 px-1">{group.state}</p>
              <ul className="space-y-1">
                {group.items.map(callout => {
                  const profile = callout.framing.profile;
                  return (
                    <li key={callout.id}>
                      <a
                        href={profile.url ?? '#'}
                        className="flex items-start gap-3 w-full px-3 py-2.5 rounded-md transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <FileText className="w-4 h-4 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
                        <span className="text-body text-foreground truncate">{profile.displayName}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
