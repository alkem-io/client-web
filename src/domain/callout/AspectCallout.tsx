import CalloutLayout, { CalloutLayoutProps } from './CalloutLayout';
import AspectCard, { AspectCardAspect } from '../../components/composite/common/cards/AspectCard/AspectCard';
import CardsLayout from '../shared/layout/CardsLayout/CardsLayout';
import React, { useState } from 'react';
import { OptionalCoreEntityIds } from '../shared/types/CoreEntityIds';
import AspectCreationDialog from '../../components/composite/aspect/AspectCreationDialog/AspectCreationDialog';
import { AspectCardFragmentDoc, useCreateAspectFromContributeTabMutation } from '../../hooks/generated/graphql';
import { useApolloErrorHandler, useAspectsData } from '../../hooks';
import { CreateAspectOnCalloutInput } from '../../models/graphql-schema';

export type OnCreateInput = Omit<CreateAspectOnCalloutInput, 'calloutID'>;

interface AspectCalloutProps extends OptionalCoreEntityIds {
  callout: CalloutLayoutProps['callout'] & {
    aspects: AspectCardAspect[];
  };
  loading?: boolean;
}

const AspectCallout = ({ callout, loading, hubNameId, challengeNameId, opportunityNameId }: AspectCalloutProps) => {
  // Dialog handling
  const [aspectDialogOpen, setAspectDialogOpen] = useState(false);
  const handleCreateDialogOpened = () => setAspectDialogOpen(true);
  const handleCreateDialogClosed = () => setAspectDialogOpen(false);

  // Create aspects
  const handleError = useApolloErrorHandler();
  const { canCreateAspects, calloutId, subscriptionEnabled } = useAspectsData({
    hubNameId: hubNameId || '',
    challengeNameId,
    opportunityNameId,
  });

  const [createAspect, { loading: creating }] = useCreateAspectFromContributeTabMutation({
    onError: handleError,
    update: (cache, { data }) => {
      if (subscriptionEnabled || !data) {
        return;
      }

      const { createAspectOnCallout } = data;

      const calloutRefId = cache.identify({
        __typename: 'Callout',
        id: calloutId,
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
          calloutID: calloutId!,
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

  return (
    <>
      <CalloutLayout callout={callout} maxHeight={42.5}>
        <CardsLayout
          items={loading ? [undefined, undefined] : callout.aspects}
          deps={[hubNameId, challengeNameId, opportunityNameId]}
          showCreateButton={canCreateAspects}
          createButtonLoading={creating}
          onCreateButtonClick={handleCreateDialogOpened}
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
        aspectNames={callout.aspects.map(x => x.displayName)}
        hubNameId={hubNameId!}
        challengeNameId={challengeNameId}
        opportunityNameId={opportunityNameId}
      />
    </>
  );
};

export default AspectCallout;
