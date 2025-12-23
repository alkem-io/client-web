import { useMemo } from 'react';
import ContributeCard from '@/core/ui/card/ContributeCard';
import CardHeader from '@/core/ui/card/CardHeader';
import CardFooter from '@/core/ui/card/CardFooter';
import CardFooterDate from '@/core/ui/card/CardFooterDate';
import { MemoIcon } from '@/domain/collaboration/memo/icon/MemoIcon';
import { LocationStateKeyCachedCallout } from '@/domain/collaboration/CalloutPage/CalloutPage';
import { CalloutContributionCardComponentProps } from '../interfaces/CalloutContributionCardComponentProps';
import CardHeaderCaption from '@/core/ui/card/CardHeaderCaption';
import MemoPreview from '@/domain/collaboration/memo/MemoPreview/MemoPreview';
import { gutters } from '@/core/ui/grid/utils';

interface MemoCardProps extends CalloutContributionCardComponentProps {}

const MemoCard = ({ contribution, columns, callout, selected }: MemoCardProps) => {
  const memo = contribution?.memo;

  const linkState = useMemo(() => {
    return {
      [LocationStateKeyCachedCallout]: callout,
      keepScroll: true,
    };
  }, [callout]);

  return (
    <ContributeCard to={memo?.profile.url} state={linkState} columns={columns}>
      <CardHeader title={memo?.profile.displayName} iconComponent={MemoIcon} contrast={selected}>
        <CardHeaderCaption color={selected ? 'white' : undefined}>
          {memo?.createdBy?.profile.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <MemoPreview memo={memo} displayName={memo?.profile.displayName} sx={{ height: gutters(4) }} />
      <CardFooter>{memo?.createdDate && <CardFooterDate date={memo?.createdDate} />}</CardFooter>
    </ContributeCard>
  );
};

export default MemoCard;
