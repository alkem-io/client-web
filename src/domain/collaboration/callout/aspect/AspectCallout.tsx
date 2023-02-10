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
import { BaseCalloutImpl } from '../Types';
import { gutters } from '../../../../core/ui/grid/utils';
import CalloutBlockFooter from '../../CalloutBlock/CalloutBlockFooter';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { useCombinedRefs } from '../../../shared/utils/useCombinedRefs';

export type OnCreateInput = Omit<CreateAspectOnCalloutInput, 'calloutID'>;

interface AspectCalloutProps extends BaseCalloutImpl {
  callout: CalloutLayoutProps['callout'];
}

const AspectCallout = forwardRef<HTMLDivElement, AspectCalloutProps>(
  (
    {
      callout,
      calloutNames,
      canCreate = false,
      hubNameId,
      challengeNameId,
      opportunityNameId,
      onCalloutEdit,
      onVisibilityChange,
      onCalloutDelete,
      contributionsCount,
    },
    ref
  ) => {
    // Dialog handling
    const [aspectDialogOpen, setAspectDialogOpen] = useState(false);
    const openCreateDialog = () => setAspectDialogOpen(true);
    const closeCreateDialog = () => setAspectDialogOpen(false);
    const navigate = useNavigate();

    const { ref: intersectionObserverRef, inView } = useInView();

    const { subscriptionEnabled, aspects, loading } = useAspectCreatedOnCalloutSubscription({
      hubNameId: hubNameId || '',
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
            displayName: aspect.displayName,
            profileData: {
              description: aspect.profileData?.description,
              tags: aspect.profileData?.tags,
            },
            type: aspect.type,
            visualUri: aspect.visualUri,
          },
        },
        optimisticResponse: {
          createAspectOnCallout: {
            __typename: 'Aspect',
            id: '',
            nameID: '',
            displayName: aspect.displayName ?? '',
            profile: {
              id: '',
              description: aspect.profileData?.description || '',
              tagset: {
                id: '-1',
                name: 'default',
                tags: aspect.profileData?.tags ?? [],
              },
            },
            type: aspect.type,
            banner: {
              id: '-1',
              name: '',
              uri: aspect.visualUri ?? '',
            },
            bannerNarrow: {
              id: '-1',
              name: '',
              uri: aspect.visualUri ?? '',
            },
          },
        },
      });

      const nameID = data?.createAspectOnCallout.nameID;

      return nameID ? { nameID } : undefined;
    };

    const aspectNames = useMemo(() => aspects?.map(x => x.displayName) ?? [], [aspects]);

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
        <PageContentBlock ref={containerRef} disablePadding disableGap>
          <CalloutLayout
            callout={callout}
            calloutNames={calloutNames}
            onVisibilityChange={onVisibilityChange}
            onCalloutEdit={onCalloutEdit}
            onCalloutDelete={onCalloutDelete}
            contributionsCount={contributionsCount}
          >
            <ScrollableCardsLayout
              items={loading || !inView ? [undefined, undefined] : aspects ?? []}
              deps={[hubNameId, challengeNameId, opportunityNameId]}
              createButton={!isMobile && createButton}
              maxHeight={gutters(22)}
            >
              {aspect => <AspectCard aspect={aspect} onClick={navigateToAspect} />}
            </ScrollableCardsLayout>
            {isMobile && <CalloutBlockFooter contributionsCount={contributionsCount} onCreate={openCreateDialog} />}
          </CalloutLayout>
        </PageContentBlock>
        <AspectCreationDialog
          open={aspectDialogOpen}
          onClose={closeCreateDialog}
          onCreate={onCreate}
          aspectNames={aspectNames}
          calloutDisplayName={callout.displayName}
          hubNameId={hubNameId!}
          challengeNameId={challengeNameId}
          opportunityNameId={opportunityNameId}
          calloutId={callout.id}
          cardTemplate={callout.cardTemplate}
          isCreating={isCreatingAspect}
        />
      </>
    );
  }
);

export default AspectCallout;
