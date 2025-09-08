import { useMemo } from 'react';
import { compact, sortBy } from 'lodash';
import useNavigate from '@/core/routing/useNavigate';
import { CalloutLayoutProps } from '../../calloutBlock/CalloutLayoutTypes';
import CreateContributionButton from '../CreateContributionButton';
import { Skeleton } from '@mui/material';
import WhiteboardCard from './WhiteboardCard';
import { BaseCalloutViewProps } from '../../CalloutViewTypes';
import CalloutBlockFooter from '../../calloutBlock/CalloutBlockFooter';
import { useScreenSize } from '@/core/ui/grid/constants';
import { normalizeLink } from '@/core/utils/links';
import { LocationStateKeyCachedCallout } from '@/domain/collaboration/CalloutPage/CalloutPage';
import { useCreateWhiteboardOnCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
import { useTranslation } from 'react-i18next';
import EmptyWhiteboard from '@/domain/common/whiteboard/EmptyWhiteboard';
import Gutters from '@/core/ui/grid/Gutters';
import CardsExpandableContainer from '../../components/CardsExpandableContainer';

interface WhiteboardContributionProps {
  id: string;
  profile: {
    id: string;
    url: string;
    displayName: string;
    visual?: { id: string; uri: string };
  };
  sortOrder: number;
  contributionId: string;
}

interface CalloutContributionsWhiteboardProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
  contributions: {
    id: string;
    sortOrder: number;
    whiteboard?: {
      id: string;
      profile: {
        id: string;
        url: string;
        displayName: string;
        visual?: { id: string; uri: string };
      };
    };
  }[];
}

const CalloutContributionsWhiteboard = ({
  ref,
  callout,
  contributions,
  loading,
  onCalloutUpdate,
  contributionsCount,
  canCreateContribution,
}: CalloutContributionsWhiteboardProps & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isSmallScreen } = useScreenSize();

  const whiteboards: WhiteboardContributionProps[] = useMemo(
    () =>
      compact(
        contributions?.map(
          contribution =>
            contribution.whiteboard && {
              ...contribution.whiteboard,
              sortOrder: contribution.sortOrder,
              contributionId: contribution.id,
            }
        )
      ) ?? [],
    [contributions]
  );

  const [createWhiteboard] = useCreateWhiteboardOnCalloutMutation();

  const createNewWhiteboard = async () => {
    const { data } = await createWhiteboard({
      variables: {
        input: {
          calloutID: callout.id,
          whiteboard: {
            profile: {
              displayName:
                callout.contributionDefaults?.defaultDisplayName ?? t('pages.whiteboard.defaultWhiteboardDisplayName'),
            },
            content: callout.contributionDefaults?.whiteboardContent ?? JSON.stringify(EmptyWhiteboard),
          },
        },
      },
      refetchQueries: [],
    });
    await onCalloutUpdate?.();
    return data?.createContributionOnCallout.whiteboard;
  };

  const handleCreate = async () => {
    const result = await createNewWhiteboard();
    if (result) {
      navigate(normalizeLink(result.profile.url), {
        state: {
          [LocationStateKeyCachedCallout]: callout,
          keepScroll: true,
        },
      });
    }
  };
  const createButton = canCreateContribution ? <CreateContributionButton onClick={handleCreate} /> : undefined;

  const showCards = useMemo(
    () => (!loading && whiteboards.length > 0) || callout.settings.contribution.enabled,
    [loading, whiteboards.length, callout.settings.contribution.enabled]
  );
  const sortedWhiteboards = useMemo(() => sortBy(whiteboards, 'sortOrder'), [whiteboards]);

  return (
    <Gutters ref={ref}>
      {showCards && (
        <CardsExpandableContainer
          items={sortedWhiteboards}
          pagination={{ total: sortedWhiteboards.length }}
          loading={loading}
          createButton={createButton}
        >
          {whiteboard =>
            whiteboard ? <WhiteboardCard key={whiteboard.id} whiteboard={whiteboard} callout={callout} /> : <Skeleton />
          }
        </CardsExpandableContainer>
      )}
      {isSmallScreen && canCreateContribution && callout.settings.contribution.enabled && (
        <CalloutBlockFooter contributionsCount={contributionsCount} onCreate={handleCreate} />
      )}
    </Gutters>
  );
};

CalloutContributionsWhiteboard.displayName = 'CalloutContributionsWhiteboard';
export default CalloutContributionsWhiteboard;
