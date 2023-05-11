import React, { Dispatch, ReactNode } from 'react';
import PageContentBlockHeaderWithDialogAction from '../../../../core/ui/content/PageContentBlockHeaderWithDialogAction';
import MultipleSelect from '../../../../core/ui/search/MultipleSelect';
import PageContentBlockGrid from '../../../../core/ui/content/PageContentBlockGrid';
import InnovationPackCard, { InnovationPackCardProps } from '../InnovationPackCard/InnovationPackCard';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { Identifiable } from '../../../shared/types/Identifiable';
import SeeMore from '../../../../core/ui/content/SeeMore';
import { useTranslation } from 'react-i18next';

interface InnovationPacksViewProps {
  filter: string[];
  headerTitle: ReactNode;
  innovationPacks: (Identifiable & InnovationPackCardProps)[] | undefined;
  expanded?: boolean;
  onFilterChange: Dispatch<string[]>;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
  hasMore?: boolean;
}

const InnovationPacksView = ({
  headerTitle,
  innovationPacks,
  filter,
  onFilterChange,
  expanded = false,
  onDialogOpen,
  onDialogClose,
  hasMore = false,
}: InnovationPacksViewProps) => {
  const handleOpenInnovationPack = () => {};

  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <PageContentBlockHeaderWithDialogAction
        title={headerTitle}
        onDialogOpen={onDialogOpen}
        onDialogClose={onDialogClose}
        expanded={expanded}
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
      <PageContentBlockGrid cards disablePadding>
        {innovationPacks?.map(({ id, ...cardProps }) => (
          <InnovationPackCard key={id} {...cardProps} onClick={handleOpenInnovationPack} />
        ))}
      </PageContentBlockGrid>
      {hasMore && <SeeMore subject={t('common.innovation-packs')} onClick={onDialogOpen} />}
    </PageContentBlock>
  );
};

export default InnovationPacksView;
