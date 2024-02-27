import { AuthorizationPrivilege, WhiteboardDetailsFragment } from '../../../../core/apollo/generated/graphql-schema';
import {
  useCalloutWhiteboardsQuery,
  useCreateWhiteboardOnCalloutMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useInView } from 'react-intersection-observer';
import { SimpleContainerProps } from '../../../../core/container/SimpleContainer';
import { useTranslation } from 'react-i18next';
import EmptyWhiteboard from '../../../common/whiteboard/EmptyWhiteboard';
import { Ref, useMemo } from 'react';
import { compact } from 'lodash';

interface WhiteboardCollectionCalloutContainerProvided {
  ref: Ref<Element>;
  whiteboards: WhiteboardDetailsFragment[];
  createNewWhiteboard: () => Promise<{ nameID: string } | undefined>;
  loading: boolean;
  canCreate: boolean;
  isCreatingWhiteboard: boolean;
}

interface WhiteboardCollectionCalloutContainerProps
  extends SimpleContainerProps<WhiteboardCollectionCalloutContainerProvided> {
  callout: {
    id: string;
    authorization?: {
      myPrivileges?: AuthorizationPrivilege[];
    };
    contributionDefaults?: {
      whiteboardContent?: string;
    };
  };
}

const WhiteboardCollectionCalloutContainer = ({ callout, children }: WhiteboardCollectionCalloutContainerProps) => {
  const { t } = useTranslation();
  const calloutId = callout.id;

  const { ref: intersectionObserverRef, inView } = useInView({
    delay: 500,
    trackVisibility: true,
    triggerOnce: true,
  });

  const { data, loading } = useCalloutWhiteboardsQuery({
    variables: {
      calloutId,
    },
    skip: !inView,
  });

  const whiteboards = useMemo(
    () => compact(data?.lookup.callout?.contributions?.map(contribution => contribution.whiteboard)) ?? [],
    [data]
  );

  const [createWhiteboard, { loading: isCreatingWhiteboard }] = useCreateWhiteboardOnCalloutMutation();

  const createNewWhiteboard = async () => {
    const { data } = await createWhiteboard({
      variables: {
        input: {
          calloutID: calloutId,
          whiteboard: {
            profileData: {
              displayName: t('pages.whiteboard.defaultWhiteboardDisplayName'),
            },
            content: callout.contributionDefaults?.whiteboardContent ?? JSON.stringify(EmptyWhiteboard),
          },
        },
      },
    });

    const nameID = data?.createContributionOnCallout.whiteboard?.nameID;

    return nameID ? { nameID } : undefined;
  };

  return (
    <>
      {children({
        ref: intersectionObserverRef,
        whiteboards,
        createNewWhiteboard,
        canCreate: callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateWhiteboard) ?? false,
        loading,
        isCreatingWhiteboard,
      })}
    </>
  );
};

export default WhiteboardCollectionCalloutContainer;
