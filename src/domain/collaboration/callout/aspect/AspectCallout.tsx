import React, { forwardRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import ScrollableCardsLayout from '../../../../core/ui/card/CardsLayout/ScrollableCardsLayout';
import AspectCreationDialog from '../../aspect/AspectCreationDialog/AspectCreationDialog';
import {
  AspectCardFragmentDoc,
  useCreateAspectFromContributeTabMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useAspectCreatedOnCalloutSubscription } from '../useAspectCreatedOnCalloutSubscription';
import { CalloutState, CreateAspectOnCalloutInput } from '../../../../core/apollo/generated/graphql-schema';
import CreateCalloutItemButton from '../CreateCalloutItemButton';
import { buildAspectUrl } from '../../../../common/utils/urlBuilders';
import AspectCard, { AspectCardAspect } from './AspectCard';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { gutters } from '../../../../core/ui/grid/utils';
import CalloutBlockFooter from '../../CalloutBlock/CalloutBlockFooter';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { useCombinedRefs } from '../../../shared/utils/useCombinedRefs';

export type OnCreateInput = Omit<CreateAspectOnCalloutInput, 'calloutID'>;

interface AspectCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
}

const AspectCallout = forwardRef<HTMLDivElement, AspectCalloutProps>(
  (
    {
      callout,
      canCreate = false,
      hubNameId,
      challengeNameId,
      opportunityNameId,
      contributionsCount,
      blockProps,
      ...calloutLayoutProps
    },
    ref
  ) => {
    // Dialog handling
    const [aspectDialogOpen, setAspectDialogOpen] = useState(false);
    const openCreateDialog = () => setAspectDialogOpen(true);
    const closeCreateDialog = () => setAspectDialogOpen(false);
    const navigate = useNavigate();

    const { ref: intersectionObserverRef, inView } = useInView({ delay: 500, trackVisibility: true });

    const { subscriptionEnabled, aspects, loading } = useAspectCreatedOnCalloutSubscription({
      hubNameId,
      calloutId: callout.id,
      challengeNameId,
      opportunityNameId,
      skip: !inView,
    });

    const [createAspect, { loading: isCreatingAspect }] = useCreateAspectFromContributeTabMutation({
      update: (cache, { data }) => {
        if (subscriptionEnabled || !data) {
          return;
        }

        const { createAspectOnCallout } = data;

        const calloutRefId = cache.identify({
          __typename: 'Callout',
          id: callout.id,
        });

        if (!calloutRefId) {
          return;
        }

        cache.modify({
          id: calloutRefId,
          fields: {
            aspects(existingAspects = []) {
              const newAspectRef = cache.writeFragment({
                data: createAspectOnCallout,
                fragment: AspectCardFragmentDoc,
                fragmentName: 'AspectCard',
              });
              return [...existingAspects, newAspectRef];
            },
          },
        });
      },
    });

    const onCreate = async (aspect: OnCreateInput) => {
      const { data } = await createAspect({
        variables: {
          aspectData: {
            calloutID: callout.id,
            profileData: {
              displayName: aspect.profileData.displayName,
              description: aspect.profileData.description,
            },
            tags: aspect.tags,
            type: aspect.type,
            visualUri: aspect.visualUri,
          },
        },
        optimisticResponse: {
          createAspectOnCallout: {
            __typename: 'Aspect',
            id: '',
            nameID: '',
            profile: {
              id: '',
              displayName: aspect.profileData.displayName,
              description: aspect.profileData?.description,
              visual: {
                id: '-1',
                name: '',
                uri: aspect.visualUri ?? '',
              },
              tagset: {
                id: '-1',
                name: 'default',
                tags: [],
              },
            },
            type: aspect.type,
          },
        },
      });

      const nameID = data?.createAspectOnCallout.nameID;

      return nameID ? { nameID } : undefined;
    };

    const aspectNames = useMemo(() => aspects?.map(x => x.profile.displayName) ?? [], [aspects]);

    const createButton = canCreate && callout.state !== CalloutState.Closed && (
      <CreateCalloutItemButton onClick={openCreateDialog} />
    );

    const navigateToAspect = (aspect: AspectCardAspect) => {
      navigate(
        buildAspectUrl(callout.nameID, aspect.nameID, {
          hubNameId: hubNameId!,
          challengeNameId,
          opportunityNameId,
        })
      );
    };

    const breakpoint = useCurrentBreakpoint();

    const isMobile = breakpoint === 'xs';

    const containerRef = useCombinedRefs(null, ref, intersectionObserverRef);

    return (
      <>
        <PageContentBlock ref={containerRef} disablePadding disableGap {...blockProps}>
          <CalloutLayout callout={callout} contributionsCount={contributionsCount} {...calloutLayoutProps}>
            <ScrollableCardsLayout
              items={loading || !inView ? [undefined, undefined] : aspects ?? []}
              deps={[hubNameId, challengeNameId, opportunityNameId]}
              createButton={!isMobile && createButton}
              maxHeight={gutters(22)}
              cards={false}
            >
              {aspect => <AspectCard aspect={aspect} onClick={navigateToAspect} />}
            </ScrollableCardsLayout>
            {isMobile && canCreate && callout.state !== CalloutState.Closed && (
              <CalloutBlockFooter contributionsCount={contributionsCount} onCreate={openCreateDialog} />
            )}
          </CalloutLayout>
        </PageContentBlock>
        <AspectCreationDialog
          open={aspectDialogOpen}
          onClose={closeCreateDialog}
          onCreate={onCreate}
          aspectNames={aspectNames}
          calloutDisplayName={callout.profile.displayName}
          hubNameId={hubNameId!}
          challengeNameId={challengeNameId}
          opportunityNameId={opportunityNameId}
          calloutId={callout.id}
          postTemplate={callout.postTemplate}
          isCreating={isCreatingAspect}
        />
      </>
    );
  }
);

export default AspectCallout;
