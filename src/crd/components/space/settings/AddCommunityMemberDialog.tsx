import { Check, Loader2, Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/crd/primitives/table';

export type AddCommunityMemberCandidate = {
  id: string;
  displayName: string;
  email?: string | null;
  avatarUrl?: string | null;
};

export type AddCommunityMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  searchPlaceholder: string;
  candidates: AddCommunityMemberCandidate[];
  loading: boolean;
  search: string;
  /** Ids already added during this dialog session — shown as "Added" instead of an Add button. */
  addedIds: ReadonlySet<string>;
  /** Id currently being added — its row shows a spinner. */
  addingId: string | null;
  emptyLabel?: string;
  onSearchChange: (next: string) => void;
  onAdd: (id: string) => void;
};

/**
 * Presentational dialog for picking a member (organization / virtual
 * contributor / user) to add to a Community. Mirrors the MUI
 * `CommunityAddMembersDialog` — all data and actions flow in via props.
 */
export function AddCommunityMemberDialog({
  open,
  onOpenChange,
  title,
  description,
  searchPlaceholder,
  candidates,
  loading,
  search,
  addedIds,
  addingId,
  emptyLabel,
  onSearchChange,
  onAdd,
}: AddCommunityMemberDialogProps) {
  const { t } = useTranslation('crd-spaceSettings');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[80vh] overflow-y-auto [&>*]:min-w-0">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 pl-9 text-sm"
            />
          </div>

          <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('community.addDialog.name', { defaultValue: 'Name' })}</TableHead>
                  <TableHead className="w-[110px] text-right">
                    {t('community.addDialog.action', { defaultValue: 'Action' })}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && candidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="py-6 text-center text-muted-foreground">
                      <Loader2 aria-hidden="true" className="inline size-4 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : candidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="py-6 text-center text-muted-foreground text-caption">
                      {emptyLabel ??
                        t('community.addDialog.empty', { defaultValue: 'No candidates match your search.' })}
                    </TableCell>
                  </TableRow>
                ) : (
                  candidates.map(c => {
                    const isAdded = addedIds.has(c.id);
                    const isAdding = addingId === c.id;
                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="size-8 border border-border shrink-0">
                              {c.avatarUrl ? <AvatarImage src={c.avatarUrl} alt="" /> : null}
                              <AvatarFallback className="text-caption">
                                {c.displayName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <span className="block text-body-emphasis truncate">{c.displayName}</span>
                              {c.email && (
                                <span className="block text-caption text-muted-foreground truncate">{c.email}</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {isAdded ? (
                            <span className="inline-flex items-center gap-1 text-caption text-emerald-600">
                              <Check aria-hidden="true" className="size-3" />
                              {t('community.addDialog.added', { defaultValue: 'Added' })}
                            </span>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => onAdd(c.id)}
                              disabled={isAdding}
                              aria-busy={isAdding}
                              aria-label={t('community.addDialog.addAriaLabel', {
                                defaultValue: 'Add {{name}}',
                                name: c.displayName,
                              })}
                            >
                              {isAdding ? (
                                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                              ) : (
                                <>
                                  <Plus aria-hidden="true" className="mr-1.5 size-4" />
                                  {t('community.addDialog.add', { defaultValue: 'Add' })}
                                </>
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
