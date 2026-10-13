import { ApolloError } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCalloutLookupQuery,
  useCalloutUrlResolveQuery,
  useSpaceCalloutsSetLookupQuery,
  useSpaceUrlResolveQuery,
  useTransferCalloutMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, UrlResolverResultState } from '@/core/apollo/generated/graphql-schema';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  CalloutFormErrorCode,
  getCalloutFormErrorCode,
} from '@/domain/collaboration/callout-form/utils/calloutFormErrors';
import toFullUrl from '../toFullUrl';

const useTransferCallout = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const handleApolloError = useApolloErrorHandler();
  const [calloutUrl, setCalloutUrl] = useState('');
  const [spaceUrl, setSpaceUrl] = useState('');
  const [mutationCompleted, setMutationCompleted] = useState(false);

  // Resolve callout URL
  const { data: calloutResolveData, loading: calloutResolveLoading } = useCalloutUrlResolveQuery({
    variables: { url: calloutUrl },
    skip: !calloutUrl,
  });

  const calloutResolved = calloutResolveData?.urlResolver;
  const resolvedCalloutId = calloutResolved?.space?.collaboration?.calloutsSet?.calloutId;
  const sourceCalloutsSetId = calloutResolved?.space?.collaboration?.calloutsSet?.id;

  // Fetch callout details and source calloutsSet privileges
  const { data: calloutData, loading: calloutLoading } = useCalloutLookupQuery({
    variables: { calloutId: resolvedCalloutId!, sourceCalloutsSetId: sourceCalloutsSetId! },
    skip: !resolvedCalloutId || !sourceCalloutsSetId,
  });

  const callout = calloutData?.lookup.callout;
  const hasTransferOffer = calloutData?.lookup.calloutsSet?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.TransferResourceOffer
  );

  // Resolve space URL
  const { data: spaceResolveData, loading: spaceResolveLoading } = useSpaceUrlResolveQuery({
    variables: { url: spaceUrl },
    skip: !spaceUrl,
  });

  const spaceResolved = spaceResolveData?.urlResolver;
  const resolvedSpaceId = spaceResolved?.space?.id;

  // Fetch space details
  const { data: spaceData, loading: spaceLoading } = useSpaceCalloutsSetLookupQuery({
    variables: { spaceId: resolvedSpaceId! },
    skip: !resolvedSpaceId,
  });

  const space = spaceData?.lookup.space;
  const calloutsSetId = space?.collaboration?.calloutsSet?.id;
  const hasTransferAccept = space?.collaboration?.calloutsSet?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.TransferResourceAccept
  );

  const [transferCalloutMutation, { loading: transferLoading }] = useTransferCalloutMutation();

  const calloutError =
    calloutResolveLoading || calloutLoading
      ? undefined
      : calloutResolved?.state === UrlResolverResultState.NotFound
        ? ('pages.admin.transferCallout.urlNotFound' as const)
        : calloutResolved && !resolvedCalloutId
          ? ('pages.admin.transferCallout.urlNotCallout' as const)
          : undefined;

  const spaceError =
    spaceResolveLoading || spaceLoading
      ? undefined
      : spaceResolved?.state === UrlResolverResultState.NotFound
        ? ('pages.admin.transferCallout.urlNotFound' as const)
        : spaceResolved && !resolvedSpaceId
          ? ('pages.admin.transferCallout.urlNotSpace' as const)
          : undefined;

  const handleCalloutSubmit = (url: string) => {
    setMutationCompleted(false);
    setCalloutUrl(toFullUrl(url));
  };

  const handleSpaceSubmit = (url: string) => {
    setMutationCompleted(false);
    setSpaceUrl(toFullUrl(url));
  };

  const handleTransfer = async () => {
    if (!callout?.id || !calloutsSetId) return;
    let result: Awaited<ReturnType<typeof transferCalloutMutation>>;
    try {
      result = await transferCalloutMutation({
        variables: { calloutId: callout.id, targetCalloutsSetId: calloutsSetId },
        // Handled below, so a Form rejection gets its own message instead of the generic one.
        context: { skipGlobalErrorHandler: true },
      });
    } catch (error) {
      if (getCalloutFormErrorCode(error) === CalloutFormErrorCode.FORM_TRANSFER_NOT_ALLOWED) {
        notify(t('pages.admin.transferCallout.formNotAllowed'), 'error');
      } else if (error instanceof ApolloError) {
        handleApolloError(error);
      }
      return;
    }
    if (!result.data?.transferCallout?.id) {
      throw new Error('Transfer failed');
    }
    setMutationCompleted(true);
  };

  return {
    callout: mutationCompleted ? undefined : callout,
    space: mutationCompleted ? undefined : space,
    calloutsSetId,
    hasTransferOffer,
    hasTransferAccept,
    calloutLoading: calloutResolveLoading || calloutLoading,
    spaceLoading: spaceResolveLoading || spaceLoading,
    transferLoading,
    calloutError,
    spaceError,
    handleCalloutSubmit,
    handleSpaceSubmit,
    handleTransfer,
  };
};

export default useTransferCallout;
