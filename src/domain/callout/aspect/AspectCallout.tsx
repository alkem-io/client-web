import CalloutLayout, { CalloutLayoutEvents, CalloutLayoutProps } from '../CalloutLayout';
import AspectCard, { AspectCardAspect } from '../../../common/components/composite/common/cards/AspectCard/AspectCard';
import CardsLayout from '../../shared/layout/CardsLayout/CardsLayout';
import React, { useMemo, useState } from 'react';
import { OptionalCoreEntityIds } from '../../shared/types/CoreEntityIds';
import AspectCreationDialog from '../../../common/components/composite/aspect/AspectCreationDialog/AspectCreationDialog';
import { AspectCardFragmentDoc, useCreateAspectFromContributeTabMutation } from '../../../hooks/generated/graphql';
import { useApolloErrorHandler, useAspectCreatedOnCalloutSubscription } from '../../../hooks';
import { CreateAspectOnCalloutInput } from '../../../models/graphql-schema';
import CreateCalloutItemButton from '../CreateCalloutItemButton';

export type OnCreateInput = Omit<CreateAspectOnCalloutInput, 'calloutID'>;

interface AspectCalloutProps extends OptionalCoreEntityIds, CalloutLayoutEvents {
  callout: CalloutLayoutProps['callout'] & {
    aspects: AspectCardAspect[];
  };
  loading?: boolean;
  canCreate?: boolean;
}

const AspectCallout = ({
  callout,
  loading,
  canCreate = false,
  hubNameId,
  challengeNameId,
  opportunityNameId,
  onCalloutEdit,
  onVisibilityChange,
  onCalloutDelete,
}: AspectCalloutProps) => {
  // Dialog handling
  const [aspectDialogOpen, setAspectDialogOpen] = useState(false);
  const handleCreateDialogOpened = () => setAspectDialogOpen(true);
  const handleCreateDialogClosed = () => setAspectDialogOpen(false);

  const handleError = useApolloErrorHandler();

  const { subscriptionEnabled } = useAspectCreatedOnCalloutSubscription({
    hubNameId: hubNameId || '',
    calloutId: callout.id,
    challengeNameId,
    opportunityNameId,
  });

  const [createAspect] = useCreateAspectFromContributeTabMutation({
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
    setAspectDialogOpen(false);
    const { data } = await createAspect({
      variables: {
        aspectData: {
          calloutID: callout.id,
          displayName: aspect.displayName,
          description: aspect.description,
          type: aspect.type,
          tags: aspect.tags,
        },
      },
      optimisticResponse: {
        createAspectOnCallout: {
          __typename: 'Aspect',
          id: '',
          nameID: '',
          displayName: aspect.displayName ?? '',
          description: aspect.description,
          type: aspect.type,
          tagset: {
            id: '-1',
            name: 'default',
            tags: aspect.tags ?? [],
          },
          banner: {
            id: '-1',
            name: '',
            uri: '',
          },
          bannerNarrow: {
            id: '-1',
            name: '',
            uri: '',
          },
        },
      },
    });

    const nameID = data?.createAspectOnCallout.nameID;

    return nameID ? { nameID } : undefined;
  };

  const aspectNames = useMemo(() => callout.aspects.map(x => x.displayName), [callout.aspects]);

  return (
    <>
      <CalloutLayout
        callout={callout}
        maxHeight={42.5}
        onVisibilityChange={onVisibilityChange}
        onCalloutEdit={onCalloutEdit}
        onCalloutDelete={onCalloutDelete}
      >
        <CardsLayout
          items={loading ? [undefined, undefined] : callout.aspects}
          deps={[hubNameId, challengeNameId, opportunityNameId]}
          {...(canCreate
            ? {
                createButtonComponent: (
                  <CreateCalloutItemButton onClick={handleCreateDialogOpened}>
                    <AspectCard />
                  </CreateCalloutItemButton>
                ),
              }
            : {})}
        >
          {aspect => (
            <AspectCard
              aspect={aspect}
              hubNameId={hubNameId}
              challengeNameId={challengeNameId}
              opportunityNameId={opportunityNameId}
              loading={!aspect}
              keepScroll
            />
          )}
        </CardsLayout>
      </CalloutLayout>
      <AspectCreationDialog
        open={aspectDialogOpen}
        onClose={handleCreateDialogClosed}
        onCreate={onCreate}
        aspectNames={aspectNames}
        hubNameId={hubNameId!}
        challengeNameId={challengeNameId}
        opportunityNameId={opportunityNameId}
      />
    </>
  );
};

export default AspectCallout;
