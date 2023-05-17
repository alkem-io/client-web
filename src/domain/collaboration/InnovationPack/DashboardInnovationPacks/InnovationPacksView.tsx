import React, { Dispatch, ReactNode } from 'react';
import PageContentBlockHeaderWithDialogAction from '../../../../core/ui/content/PageContentBlockHeaderWithDialogAction';
import MultipleSelect from '../../../../core/ui/search/MultipleSelect';
import InnovationPackCard, { InnovationPackCardProps } from '../InnovationPackCard/InnovationPackCard';
import PageContentBlock, { PageContentBlockProps } from '../../../../core/ui/content/PageContentBlock';
import { Identifiable } from '../../../shared/types/Identifiable';
import SeeMore from '../../../../core/ui/content/SeeMore';
import { useTranslation } from 'react-i18next';
import ScrollableCardsLayout from '../../../../core/ui/card/CardsLayout/ScrollableCardsLayout';

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
  ...props
}: InnovationPacksViewProps & PageContentBlockProps) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock {...props}>
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
      {innovationPacks && (
        <ScrollableCardsLayout items={innovationPacks} minHeight={0} noVerticalMarginTop>
          {({ id, ...cardProps }) => <InnovationPackCard key={id} {...cardProps} />}
        </ScrollableCardsLayout>
      )}
      {hasMore && <SeeMore subject={t('common.innovation-packs')} onClick={onDialogOpen} />}
    </PageContentBlock>
  );
};

export default InnovationPacksView;
