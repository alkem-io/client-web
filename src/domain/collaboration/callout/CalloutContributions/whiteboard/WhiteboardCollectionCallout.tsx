import { forwardRef, useMemo } from 'react';
import { sortBy } from 'lodash';
import useNavigate from '@/core/routing/useNavigate';
import CalloutLayout, { CalloutLayoutProps } from '../../calloutBlock/CalloutLayout';
import ScrollableCardsLayout from '@/domain/collaboration/callout/components/ScrollableCardsLayout';
import CreateContributionButton from '../CreateContributionButton';
import { Skeleton } from '@mui/material';
import WhiteboardCard, { WhiteboardCardWhiteboard } from './WhiteboardCard';
import { BaseCalloutViewProps } from '../../CalloutViewTypes';
import { gutters } from '@/core/ui/grid/utils';
import CalloutBlockFooter from '../../calloutBlock/CalloutBlockFooter';
import { useScreenSize } from '@/core/ui/grid/constants';
import { Identifiable } from '@/core/utils/Identifiable';
import { normalizeLink } from '@/core/utils/links';
import { LocationStateKeyCachedCallout } from '@/domain/collaboration/CalloutPage/CalloutPage';
import CalloutSettingsContainer from '../../calloutBlock/CalloutSettingsContainer';

interface WhiteboardCollectionCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
  whiteboards: (Identifiable & WhiteboardCardWhiteboard)[];
  createNewWhiteboard: () => Promise<{ profile: { url: string } } | undefined>;
}

const WhiteboardCollectionCallout = forwardRef<Element, WhiteboardCollectionCalloutProps>(
  (
    {
      callout,
      whiteboards,
      loading,
      canCreateContribution = false,
      contributionsCount,
      createNewWhiteboard,
      expanded,
      onExpand,
      onCollapse,
      ...calloutSettingsProps
    },
    ref
  ) => {
    const navigate = useNavigate();
    const { isSmallScreen } = useScreenSize();

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

    const createButton = canCreateContribution && <CreateContributionButton onClick={handleCreate} />;

    const showCards = useMemo(
      () => (!loading && whiteboards.length > 0) || callout.settings.contribution.enabled,
      [loading, whiteboards.length, callout.settings.contribution.enabled]
    );
    const sortedWhiteboards = useMemo(() => sortBy(whiteboards, 'sortOrder'), [whiteboards]);

    return (
      <CalloutSettingsContainer
        callout={callout}
        items={{ whiteboards: sortedWhiteboards }}
        expanded={expanded}
        onExpand={onExpand}
        {...calloutSettingsProps}
      >
        {calloutSettingsProvided => (
          <CalloutLayout
            contentRef={ref}
            callout={callout}
            contributionsCount={contributionsCount}
            expanded={expanded}
            onExpand={onExpand}
            onCollapse={onCollapse}
            {...calloutSettingsProvided}
            disableMarginal
          >
            {showCards && (
              <ScrollableCardsLayout
                items={loading ? [undefined, undefined] : sortedWhiteboards}
                createButton={!isSmallScreen && createButton}
                maxHeight={gutters(22)}
              >
                {whiteboard =>
                  whiteboard ? (
                    <WhiteboardCard key={whiteboard.id} whiteboard={whiteboard} callout={callout} />
                  ) : (
                    <Skeleton />
                  )
                }
              </ScrollableCardsLayout>
            )}
            {isSmallScreen && canCreateContribution && callout.settings.contribution.enabled && (
              <CalloutBlockFooter contributionsCount={contributionsCount} onCreate={handleCreate} />
            )}
          </CalloutLayout>
        )}
      </CalloutSettingsContainer>
    );
  }
);

export default WhiteboardCollectionCallout;
