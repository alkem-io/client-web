import React, { ReactNode, useMemo, useState } from 'react';
import PageContentBlockHeaderWithDialogAction from '../../../../core/ui/content/PageContentBlockHeaderWithDialogAction';
import MultipleSelect from '../../../../core/ui/search/MultipleSelect';
import PageContentBlockGrid from '../../../../core/ui/content/PageContentBlockGrid';
import InnovationPackCard, { InnovationPackCardProps } from '../InnovationPackCard/InnovationPackCard';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { Identifiable } from '../../../shared/types/Identifiable';
import filterFn, { ValueType } from '../../../../common/components/core/card-filter/filterFn';

interface DashboardInnovationPacksProps {
  headerTitle: ReactNode;
  innovationPacks: (Identifiable & InnovationPackCardProps)[] | undefined;
}

const innovationPackValueGetter = (innovationPack: Identifiable & InnovationPackCardProps): ValueType => ({
  id: innovationPack.id,
  values: [innovationPack.displayName, ...(innovationPack.tags ?? [])],
});

const DashboardInnovationPacks = ({ headerTitle, innovationPacks }: DashboardInnovationPacksProps) => {
  const [filter, onFilterChange] = useState<string[]>([]);

  const handleOpenInnovationPack = () => {};

  const filteredInnovationPacks = useMemo(
    () => filterFn(innovationPacks ?? [], filter, innovationPackValueGetter),
    [innovationPacks, filter]
  );

  return (
    <PageContentBlock>
      <PageContentBlockHeaderWithDialogAction
        title={headerTitle}
        onDialogOpen={() => {}}
        actions={
          <MultipleSelect
            onChange={onFilterChange}
            value={filter}
            minLength={2}
            containerProps={{
              marginLeft: theme => theme.spacing(2),
            }}
            size="xsmall"
          />
        }
      />
      <PageContentBlockGrid>
        {filteredInnovationPacks?.map(({ id, ...cardProps }) => (
          <InnovationPackCard key={id} {...cardProps} onClick={handleOpenInnovationPack} />
        ))}
      </PageContentBlockGrid>
    </PageContentBlock>
  );
};

export default DashboardInnovationPacks;
