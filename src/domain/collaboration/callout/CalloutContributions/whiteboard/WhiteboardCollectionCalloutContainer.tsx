import {
  AuthorizationPrivilege,
  CalloutAllowedContributors,
  CalloutContributionType,
} from '@/core/apollo/generated/graphql-schema';
import {
  refetchCalloutContributionsQuery,
  useCalloutContributionsQuery,
  useCreateWhiteboardOnCalloutMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useInView } from 'react-intersection-observer';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { useTranslation } from 'react-i18next';
import EmptyWhiteboard from '@/domain/common/whiteboard/EmptyWhiteboard';
import { Ref, useMemo } from 'react';
import { compact } from 'lodash';
import { CalloutSettingsModelFull } from '../../../new-callout/models/CalloutSettingsModel';

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
  canCreateContribution: boolean;
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
    settings: Pick<CalloutSettingsModelFull, 'contribution'>;
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

  const { data, loading } = useCalloutContributionsQuery({
    variables: {
      calloutId,
      includeWhiteboard: true,
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
            profile: {
              displayName: t('pages.whiteboard.defaultWhiteboardDisplayName'),
            },
            content: callout.contributionDefaults?.whiteboardContent ?? JSON.stringify(EmptyWhiteboard),
          },
        },
      },
      refetchQueries: [refetchCalloutContributionsQuery({ calloutId: calloutId, includeWhiteboard: true })],
    });

    return data?.createContributionOnCallout.whiteboard;
  };

  const canCreateContribution =
    (callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateWhiteboard) &&
      callout.settings.contribution.enabled &&
      callout.settings.contribution.allowedTypes.includes(CalloutContributionType.Whiteboard) &&
      ((callout.settings.contribution.canAddContributions.includes(CalloutAllowedContributors.Admins) &&
        callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update)) ||
        callout.settings.contribution.canAddContributions.includes(CalloutAllowedContributors.Members))) ??
    false;

  return (
    <>
      {children({
        ref: intersectionObserverRef,
        whiteboards,
        createNewWhiteboard,
        canCreateContribution,
        loading,
        isCreatingWhiteboard,
      })}
    </>
  );
};

export default WhiteboardCollectionCalloutContainer;
