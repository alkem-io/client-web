import { PropsWithChildren, useCallback } from 'react';
import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { DocumentNode } from 'graphql';
import { ContainerPropsWithProvided, renderComponentOrChildrenFn } from '../../utils/containers/ComponentOrChildrenFn';
import { Preference, PreferenceType } from '../../models/graphql-schema';
import { PreferenceTypes } from '../../models/preference-types';
import { useApolloErrorHandler } from '../../hooks';

export interface Props<TQuery, TQVariable, TMVariable> {
  queryDocument: DocumentNode;
  queryVariables: TQVariable;
  querySelector: (query: TQuery) => Preference[];
  mutationDocument: DocumentNode;
  mutationVariables: (queryVariables: TQVariable, type: PreferenceTypes, value: boolean) => TMVariable;
  selectedGroups?: string[];
  excludeTypes?: PreferenceType[];
}

interface Provided {
  loading: boolean;
  error?: ApolloError;
  submitting: boolean;
  preferences: Preference[];
  onUpdate: (type: PreferenceTypes, value: boolean) => void;
}

export type PreferenceContainerProps<TQuery, TVariable, TMVariable> = ContainerPropsWithProvided<
  Props<TQuery, TVariable, TMVariable>,
  Provided
>;

const PreferenceContainer = <TQuery, TQVariable, TMVariable>({
  queryDocument,
  queryVariables,
  querySelector,
  mutationDocument,
  mutationVariables,
  selectedGroups,
  excludeTypes,
  ...rendered
}: PropsWithChildren<PreferenceContainerProps<TQuery, TQVariable, TMVariable>>) => {
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

  return renderComponentOrChildrenFn(rendered, {
    loading,
    submitting,
    error,
    preferences,
    onUpdate,
  });
};
export default PreferenceContainer;
