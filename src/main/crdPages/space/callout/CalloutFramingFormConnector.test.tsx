import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { PostCardFragmentDoc } from '@/core/apollo/generated-v2/apollo-hooks';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { mapPostToCallout } from '../dataMappers/calloutDataMapper';
import { nativePost } from '../dataMappers/nativePostFixtures.test-utils';
import { CalloutFramingFormConnector } from './CalloutFramingFormConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({ space: { about: { profile: { displayName: 'Space' } } } }),
}));
vi.mock('@/domain/space/hooks/useSubSpace', () => ({
  useSubSpace: () => ({ subspace: { about: { profile: { displayName: '' } } } }),
}));

describe('CalloutFramingFormConnector (021 D11)', () => {
  test('renders the served questions on mount and sends no request; the review stays closed without the read-all flag', () => {
    const operations: string[] = [];
    const client = new ApolloClient({
      cache: createV2Cache(),
      link: new ApolloLink(operation => {
        operations.push(operation.operationName);
        return Observable.of();
      }),
    });
    const post = nativePost('form', {
      contentKind: 'form',
      responseKind: 'form_response',
      can: { ...nativePost('x').can, respond: true },
      content: {
        __typename: 'FormContent',
        questions: [{ id: 'q1', prompt: 'What do you think?', type: 'long_text', required: true }],
        responseCount: 7,
        myResponseCount: 0,
      },
    });
    client.writeFragment({ fragment: PostCardFragmentDoc, fragmentName: 'PostCard', id: 'Post:form', data: post });
    render(
      <ApolloProvider client={client}>
        <CalloutFramingFormConnector callout={mapPostToCallout(post, [])} />
      </ApolloProvider>
    );
    expect(screen.getByText('What do you think?')).toBeInTheDocument();
    expect(screen.queryByText('formResponses.viewAction')).not.toBeInTheDocument();
    expect(operations).toEqual([]);
  });
});
