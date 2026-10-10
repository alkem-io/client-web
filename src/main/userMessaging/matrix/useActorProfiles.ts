import { useApolloClient } from '@apollo/client';
import { useEffect, useState } from 'react';
import { ActorProfileDocument } from '@/core/apollo/generated/apollo-hooks';
import type { ActorProfileQuery, ActorProfileQueryVariables } from '@/core/apollo/generated/graphql-schema';
import type { SenderProfile } from './toConversationMessage';

/**
 * Profiles for message senders who are no longer members of the conversation,
 * one lookup per actor id (Apollo-cached). A denied or failed lookup leaves the
 * sender without a profile rather than failing the thread.
 */
const useActorProfiles = (actorIds: readonly string[]): ReadonlyMap<string, SenderProfile> => {
  const client = useApolloClient();
  const [profiles, setProfiles] = useState<ReadonlyMap<string, SenderProfile>>(new Map());
  const [attempted] = useState(() => new Set<string>());

  const pendingKey = actorIds.filter(actorId => !attempted.has(actorId)).join(',');

  useEffect(() => {
    if (pendingKey === '') {
      return;
    }
    for (const actorId of pendingKey.split(',')) {
      attempted.add(actorId);
      client
        .query<ActorProfileQuery, ActorProfileQueryVariables>({
          query: ActorProfileDocument,
          variables: { actorId },
        })
        .then(({ data }) => {
          const profile = data?.actor?.profile;
          if (!profile) {
            return;
          }
          setProfiles(previous =>
            new Map(previous).set(actorId, { displayName: profile.displayName, avatarUri: profile.avatar?.uri })
          );
        })
        .catch(() => {});
    }
  }, [client, pendingKey, attempted]);

  return profiles;
};

export { useActorProfiles };
