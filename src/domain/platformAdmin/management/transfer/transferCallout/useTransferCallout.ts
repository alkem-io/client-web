import { useState } from 'react';
import {
  useCalloutUrlResolveQuery,
  useCalloutLookupQuery,
  useSpaceUrlResolveQuery,
  useSpaceCalloutsSetLookupQuery,
  useTransferCalloutMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, UrlResolverResultState } from '@/core/apollo/generated/graphql-schema';

const toFullUrl = (input: string): string => {
  try {
    new URL(input);
    return input;
  } catch {
    const path = input.startsWith('/') ? input : `/${input}`;
    return `${globalThis.location.origin}${path}`;
  }
};

const useTransferCallout = () => {
  const [calloutUrl, setCalloutUrl] = useState('');
  const [spaceUrl, setSpaceUrl] = useState('');

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
    calloutResolved?.state === UrlResolverResultState.NotFound
      ? ('pages.admin.transferCallout.urlNotFound' as const)
      : calloutResolved && !resolvedCalloutId
        ? ('pages.admin.transferCallout.urlNotCallout' as const)
        : undefined;

  const spaceError =
    spaceResolved?.state === UrlResolverResultState.NotFound
      ? ('pages.admin.transferCallout.urlNotFound' as const)
      : spaceResolved && !resolvedSpaceId
        ? ('pages.admin.transferCallout.urlNotSpace' as const)
        : undefined;

  const handleCalloutSubmit = (url: string) => {
    setCalloutUrl(toFullUrl(url));
  };

  const handleSpaceSubmit = (url: string) => {
    setSpaceUrl(toFullUrl(url));
  };

  const handleTransfer = async () => {
    if (!callout?.id || !calloutsSetId) return;
    await transferCalloutMutation({
      variables: { calloutId: callout.id, targetCalloutsSetId: calloutsSetId },
    });
  };

  return {
    callout,
    space,
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
