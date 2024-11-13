import { AuthorizationPrivilege } from '@core/apollo/generated/graphql-schema';
import {
  refetchCalloutWhiteboardsQuery,
  useCalloutWhiteboardsQuery,
  useCreateWhiteboardOnCalloutMutation,
} from '@core/apollo/generated/apollo-hooks';
import { useInView } from 'react-intersection-observer';
import { SimpleContainerProps } from '@core/container/SimpleContainer';
import { useTranslation } from 'react-i18next';
import EmptyWhiteboard from '../../../common/whiteboard/EmptyWhiteboard';
import { Ref, useMemo } from 'react';
import { compact } from 'lodash';

interface WhiteboardContributionProps {
  id: string;
  createdDate: Date;
  profile: {
    id: string;
    url: string;
    displayName: string;
    visual?: { id: string; uri: string };
  };
  sortOrder: number;
  contributionId: string;
}

interface WhiteboardCollectionCalloutContainerProvided {
  ref: Ref<Element>;
  whiteboards: WhiteboardContributionProps[];
  createNewWhiteboard: () => Promise<{ profile: { url: string } } | undefined>;
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

  const whiteboards: WhiteboardContributionProps[] = useMemo(
    () =>
      compact(
        data?.lookup.callout?.contributions?.map(
          contribution =>
            contribution.whiteboard && {
              ...contribution.whiteboard,
              sortOrder: contribution.sortOrder,
              contributionId: contribution.id,
            }
        )
      ) ?? [],
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
      refetchQueries: [refetchCalloutWhiteboardsQuery({ calloutId: calloutId })],
    });

    return data?.createContributionOnCallout.whiteboard;
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
