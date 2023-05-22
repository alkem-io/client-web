import React, { ReactNode, useLayoutEffect, useMemo, useState } from 'react';
import { InnovationPackCardProps } from '../InnovationPackCard/InnovationPackCard';
import { Identifiable } from '../../../shared/types/Identifiable';
import filterFn, { ValueType } from '../../../../common/components/core/card-filter/filterFn';
import InnovationPacksView from './InnovationPacksView';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { useTranslation } from 'react-i18next';

interface DashboardInnovationPacksProps {
  headerTitle: ReactNode;
  innovationPacks: (Identifiable & InnovationPackCardProps)[] | undefined;
}

const innovationPackValueGetter = (innovationPack: Identifiable & InnovationPackCardProps): ValueType => ({
  id: innovationPack.id,
  values: [innovationPack.displayName, ...(innovationPack.tags ?? [])],
});

const MAX_PACKS_WHEN_NOT_EXPANDED = 10;

const DashboardInnovationPacks = ({ headerTitle, innovationPacks }: DashboardInnovationPacksProps) => {
  const [filter, onFilterChange] = useState<string[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredInnovationPacks = useMemo(
    () => filterFn(innovationPacks ?? [], filter, innovationPackValueGetter),
    [innovationPacks, filter]
  );

  const { t } = useTranslation();

  const isExpandable = true;

  useLayoutEffect(() => {
    // This can be made computable but then the Dialog would reopen when going back to desktop resolution
    if (!isExpandable) {
      setIsDialogOpen(false);
    }
  }, [isExpandable]);

  return (
    <>
      <InnovationPacksView
        filter={filter}
        headerTitle={headerTitle}
        innovationPacks={
          isExpandable ? filteredInnovationPacks.slice(0, MAX_PACKS_WHEN_NOT_EXPANDED) : filteredInnovationPacks
        }
        onFilterChange={onFilterChange}
        expanded={isDialogOpen}
        onDialogOpen={() => setIsDialogOpen(true)}
        hasMore={isExpandable && filteredInnovationPacks.length > MAX_PACKS_WHEN_NOT_EXPANDED}
      />
      <DialogWithGrid open={isDialogOpen} onClose={() => setIsDialogOpen(false)} columns={12}>
        <InnovationPacksView
          filter={filter}
          headerTitle={t('common.innovation-packs')}
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
