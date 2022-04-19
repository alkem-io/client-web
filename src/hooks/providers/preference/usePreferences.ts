import { useCallback } from 'react';
import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { DocumentNode } from 'graphql';
import { Preference, PreferenceType } from '../../../models/graphql-schema';
import { PreferenceTypes } from '../../../models/preference-types';
import { useApolloErrorHandler } from '../..';

interface Provided {
  loading: boolean;
  error?: ApolloError;
  submitting: boolean;
  preferences: Preference[];
  onUpdate: (type: PreferenceTypes, value: boolean) => void;
}

export const usePreferences = <TQuery, TQVariable, TMVariable>(
  queryDocument: DocumentNode,
  queryVariables: TQVariable,
  querySelector: (query: TQuery) => Preference[],
  mutationDocument: DocumentNode,
  mutationVariables: (queryVariables: TQVariable, type: PreferenceTypes, value: boolean) => TMVariable,
  selectedGroups?: string[],
  excludeTypes?: PreferenceType[]
): Provided => {
  const handleError = useApolloErrorHandler();

  const { data, loading, error } = useQuery<TQuery, TQVariable>(queryDocument, {
    variables: queryVariables,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });
  const prefs = (data && querySelector(data)) ?? [];
  const preferences =
    selectedGroups || excludeTypes
      ? prefs.filter(x => selectedGroups?.includes(x.definition.group) && !excludeTypes?.includes(x.definition.type))
      : prefs;

  const [updatePreference, { loading: submitting }] = useMutation(mutationDocument, { onError: handleError });

  const onUpdate = useCallback(
    (type: PreferenceTypes, checked: boolean) => {
      updatePreference({
        variables: mutationVariables(queryVariables, type, checked),
      });
    },
    [mutationVariables, queryVariables]
  );

  return { loading, submitting, error, preferences, onUpdate };
};
