import { useCallback } from 'react';
import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { DocumentNode } from 'graphql';
import { Preference, PreferenceType } from '../../../../core/apollo/generated/graphql-schema';
import { PreferenceTypes } from '../preference-types';

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
  querySelector: (query: TQuery) => Preference[] | undefined,
  mutationDocument: DocumentNode,
  mutationVariables: (queryVariables: TQVariable, type: PreferenceTypes, value: boolean) => TMVariable,
  selectedGroups?: string[],
  excludeTypes?: PreferenceType[]
): Provided => {
  // @ts-ignore TS5UPGRADE
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

  const [updatePreference, { loading: submitting }] = useMutation(mutationDocument);

  const onUpdate = useCallback(
    (type: PreferenceTypes, checked: boolean) => {
      // @ts-ignore TS5UPGRADE
      updatePreference({ variables: mutationVariables(queryVariables, type, checked) });
    },
    [mutationVariables, queryVariables, updatePreference]
  );

  return { loading, submitting, error, preferences, onUpdate };
};
