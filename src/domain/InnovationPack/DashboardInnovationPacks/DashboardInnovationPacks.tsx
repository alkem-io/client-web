import { type ReactNode, useState } from 'react';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import filterFn, { type ValueType } from '@/core/utils/filtering/filterFn';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { InnovationPackCardProps } from '../InnovationPackCard/InnovationPackCard';
import InnovationPacksView from './InnovationPacksView';

type DashboardInnovationPacksProps = {
  headerTitle: ReactNode;
  dialogTitle: ReactNode;
  innovationPacks: (Identifiable & InnovationPackCardProps)[] | undefined;
  loading?: boolean;
};

const MAX_PACKS_WHEN_NOT_EXPANDED = 10;

const DashboardInnovationPacks = ({
  loading,
  headerTitle,
  dialogTitle,
  innovationPacks,
}: DashboardInnovationPacksProps) => {
  const [filter, onFilterChange] = useState<string[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredInnovationPacks = filterFn(innovationPacks ?? [], filter, innovationPackValueGetter);

  return (
    <>
      <InnovationPacksView
        filter={filter}
        headerTitle={headerTitle}
        innovationPacks={filteredInnovationPacks.slice(0, MAX_PACKS_WHEN_NOT_EXPANDED)}
        onFilterChange={onFilterChange}
        expanded={isDialogOpen}
        onDialogOpen={() => setIsDialogOpen(true)}
        hasMore={filteredInnovationPacks.length > MAX_PACKS_WHEN_NOT_EXPANDED}
        loading={loading}
      />

      <DialogWithGrid
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        columns={12}
        aria-labelledby="innovation-packs-dialog-title"
      >
        <InnovationPacksView
          filter={filter}
          headerTitle={dialogTitle}
          headerTitleId="innovation-packs-dialog-title"
          innovationPacks={filteredInnovationPacks}
          onFilterChange={onFilterChange}
          expanded={isDialogOpen}
          onDialogClose={() => setIsDialogOpen(false)}
          sx={{ flexShrink: 1 }}
          loading={loading}
        />
      </DialogWithGrid>
    </>
  );
};

export default DashboardInnovationPacks;

function innovationPackValueGetter(innovationPack: Identifiable & InnovationPackCardProps): ValueType {
  return {
    id: innovationPack.id,
    values: [innovationPack.displayName, ...(innovationPack.tags ?? [])],
  };
}
