import { useCallback, useMemo } from 'react';
import { Author } from '../../models/discussion/author';
import { buildUserProfileUrl } from '../../utils/urlBuilders';
import { useAuthorDetailsQuery } from '../generated/graphql';

export const useAuthorsDetails = (authorIDds: string[]) => {
  const { data: authorData, loading } = useAuthorDetailsQuery({
    variables: { ids: authorIDds },
    skip: authorIDds.length === 0,
  });

  const authors = useMemo(
    () =>
      authorData?.usersById.map<Author>(a => ({
        id: a.id,
        displayName: a.displayName,
        firstName: a.firstName,
        lastName: a.lastName,
        avatarUrl: a.profile?.avatar || '',
        url: buildUserProfileUrl(a.nameID),
      })),
    [authorData]
  );

  const getAuthor = useCallback((senderId: string) => authors?.find(a => a.id === senderId), [authors]);
  const getAuthors = useCallback(
    (senderIds: string[]) => authors?.filter(a => senderIds.includes(a.id)) || [],
    [authors]
  );

  return {
    authors,
    getAuthor,
    getAuthors,
    loading,
  };
};
