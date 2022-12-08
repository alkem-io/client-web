import React, { useMemo, useState } from 'react';
import BallotOutlinedIcon from '@mui/icons-material/BallotOutlined';
import { useNavigate } from 'react-router-dom';

import CalloutLayout, { CalloutLayoutEvents, CalloutLayoutProps } from '../CalloutLayout';
import AspectCard, { AspectCardAspect } from '../../aspect/AspectCard/AspectCard';
import CardsLayout from '../../../shared/layout/CardsLayout/CardsLayout';
import { OptionalCoreEntityIds } from '../../../shared/types/CoreEntityIds';
import AspectCreationDialog from '../../aspect/AspectCreationDialog/AspectCreationDialog';
import {
  AspectCardFragmentDoc,
  useCreateAspectFromContributeTabMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useApolloErrorHandler } from '../../../../core/apollo/hooks/useApolloErrorHandler';
import { useAspectCreatedOnCalloutSubscription } from '../useAspectCreatedOnCalloutSubscription';
import { CalloutState, CreateAspectOnCalloutInput } from '../../../../core/apollo/generated/graphql-schema';
import CreateCalloutItemButton from '../CreateCalloutItemButton';
import CardsLayoutScroller from '../../../shared/layout/CardsLayout/CardsLayoutScroller';
import ContributeCard from '../../aspect/AspectCard/ContributeCard';
import CardExtraInfoSection from '../../aspect/AspectCard/CardExtraInfoSection';
import CardDetailsSection, { CardDescription, CardTags } from '../../aspect/AspectCard/CardDetailsSection';
import CardTitleSection from '../../aspect/AspectCard/CardTitleSection';
import { buildAspectUrl } from '../../../../common/utils/urlBuilders';

export type OnCreateInput = Omit<CreateAspectOnCalloutInput, 'calloutID'>;

interface AspectCalloutProps extends OptionalCoreEntityIds, CalloutLayoutEvents {
  callout: CalloutLayoutProps['callout'] & {
    aspects: AspectCardAspect[];
  };
  calloutNames: string[];
  loading?: boolean;
  canCreate?: boolean;
}

const AspectCallout = ({
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
}: AspectCalloutProps) => {
  // Dialog handling
  const [aspectDialogOpen, setAspectDialogOpen] = useState(false);
  const handleCreateDialogOpened = () => setAspectDialogOpen(true);
  const handleCreateDialogClosed = () => setAspectDialogOpen(false);
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
  const createButtonComponent = useMemo(
    () =>
      callout.state !== CalloutState.Closed ? (
        <CreateCalloutItemButton onClick={handleCreateDialogOpened}>
          <AspectCard />
        </CreateCalloutItemButton>
      ) : undefined,
    [callout.state]
  );

  return (
    <>
      <CalloutLayout
        callout={callout}
        calloutNames={calloutNames}
        onVisibilityChange={onVisibilityChange}
        onCalloutEdit={onCalloutEdit}
        onCalloutDelete={onCalloutDelete}
      >
        <CardsLayoutScroller maxHeight={372}>
          <CardsLayout
            items={loading ? [undefined, undefined] : callout.aspects}
            deps={[hubNameId, challengeNameId, opportunityNameId]}
            {...(canCreate ? { createButtonComponent } : {})}
          >
            {aspect => {
              const createdDate = aspect?.createdDate && new Date(aspect?.createdDate);
              return (
                <ContributeCard
                  onClick={() => {
                    if (aspect?.calloutNameId) {
                      navigate(
                        buildAspectUrl(aspect?.calloutNameId, aspect?.nameID, {
                          hubNameId: hubNameId!,
                          challengeNameId,
                          opportunityNameId,
                        })
                      );
                    }
                  }}
                  titleComponent={
                    <CardTitleSection
                      title={aspect?.displayName}
                      iconComponent={BallotOutlinedIcon}
                      createdBy={aspect?.createdBy.displayName}
                    />
                  }
                  contentComponent={
                    <CardDetailsSection>
                      <CardDescription description={aspect?.profile!.description} />
                      <CardTags tags={aspect?.profile?.tagset?.tags} />
                    </CardDetailsSection>
                  }
                  extraInfoComponent={
                    <CardExtraInfoSection createdDate={createdDate} messageCount={aspect?.comments?.messageCount} />
                  }
                />
              );
            }}
          </CardsLayout>
        </CardsLayoutScroller>
      </CalloutLayout>
      <AspectCreationDialog
        open={aspectDialogOpen}
        onClose={handleCreateDialogClosed}
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
};

export default AspectCallout;
