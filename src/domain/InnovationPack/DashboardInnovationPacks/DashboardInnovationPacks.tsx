import React, { ReactNode, useMemo, useState } from 'react';
import { InnovationPackCardProps } from '../InnovationPackCard/InnovationPackCard';
import { Identifiable } from '@core/utils/Identifiable';
import filterFn, { ValueType } from '@core/utils/filtering/filterFn';
import InnovationPacksView from './InnovationPacksView';
import DialogWithGrid from '@core/ui/dialog/DialogWithGrid';

interface DashboardInnovationPacksProps {
  headerTitle: ReactNode;
  dialogTitle: ReactNode;
  innovationPacks: (Identifiable & InnovationPackCardProps)[] | undefined;
}

const innovationPackValueGetter = (innovationPack: Identifiable & InnovationPackCardProps): ValueType => ({
  id: innovationPack.id,
  values: [innovationPack.displayName, ...(innovationPack.tags ?? [])],
});

const MAX_PACKS_WHEN_NOT_EXPANDED = 10;

const DashboardInnovationPacks = ({ headerTitle, dialogTitle, innovationPacks }: DashboardInnovationPacksProps) => {
  const [filter, onFilterChange] = useState<string[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredInnovationPacks = useMemo(
    () => filterFn(innovationPacks ?? [], filter, innovationPackValueGetter),
    [innovationPacks, filter]
  );

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
      />
      <DialogWithGrid open={isDialogOpen} onClose={() => setIsDialogOpen(false)} columns={12}>
        <InnovationPacksView
          filter={filter}
          headerTitle={dialogTitle}
          innovationPacks={filteredInnovationPacks}
          onFilterChange={onFilterChange}
          expanded={isDialogOpen}
          onDialogClose={() => setIsDialogOpen(false)}
          sx={{ flexShrink: 1 }}
        />
      </DialogWithGrid>
    </>
  );
};

export default DashboardInnovationPacks;
