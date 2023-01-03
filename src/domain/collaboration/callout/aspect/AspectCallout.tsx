import React, { forwardRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import ScrollableCardsLayout from '../../../../core/ui/card/CardsLayout/ScrollableCardsLayout';
import AspectCreationDialog from '../../aspect/AspectCreationDialog/AspectCreationDialog';
import {
  AspectCardFragmentDoc,
  useCreateAspectFromContributeTabMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useApolloErrorHandler } from '../../../../core/apollo/hooks/useApolloErrorHandler';
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

export type OnCreateInput = Omit<CreateAspectOnCalloutInput, 'calloutID'>;

interface AspectCalloutProps extends BaseCalloutImpl {
  callout: CalloutLayoutProps['callout'] & {
    aspects: AspectCardAspect[];
  };
}

const AspectCallout = forwardRef<HTMLDivElement, AspectCalloutProps>(
  (
    {
      callout,
      calloutNames,
      loading,
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
    const handleError = useApolloErrorHandler();
    const navigate = useNavigate();

    const { subscriptionEnabled } = useAspectCreatedOnCalloutSubscription({
      hubNameId: hubNameId || '',
      calloutId: callout.id,
      challengeNameId,
      opportunityNameId,
    });

    const [createAspect, { loading: isCreatingAspect }] = useCreateAspectFromContributeTabMutation({
      onError: handleError,
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

    const aspectNames = useMemo(() => callout.aspects.map(x => x.displayName), [callout.aspects]);

    const createButton = canCreate && callout.state !== CalloutState.Closed && (
      <CreateCalloutItemButton onClick={openCreateDialog} />
    );

    const navigateToAspect = (aspect: AspectCardAspect) => {
      navigate(
        buildAspectUrl(aspect.calloutNameId, aspect.nameID, {
          hubNameId: hubNameId!,
          challengeNameId,
          opportunityNameId,
        })
      );
    };

    const breakpoint = useCurrentBreakpoint();

    const isMobile = breakpoint === 'xs';

    return (
      <>
        <PageContentBlock ref={ref} disablePadding disableGap>
          <CalloutLayout
            callout={callout}
            calloutNames={calloutNames}
            onVisibilityChange={onVisibilityChange}
            onCalloutEdit={onCalloutEdit}
            onCalloutDelete={onCalloutDelete}
            contributionsCount={contributionsCount}
          >
            <ScrollableCardsLayout
              items={loading ? [undefined, undefined] : callout.aspects}
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
