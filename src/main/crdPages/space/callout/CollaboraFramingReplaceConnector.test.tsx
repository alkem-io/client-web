import { ApolloError } from '@apollo/client';
import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const replaceOptions = vi.fn();
const replace = vi.fn();
const dialogProps = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useReplaceCollaboraDocumentMutation: (options: unknown) => {
    replaceOptions(options);
    return [replace, { loading: false }];
  },
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/core/logging/sentry/log', () => ({ error: vi.fn() }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { exists: () => false } }),
}));
vi.mock('@/crd/forms/callout/ReplaceCollaboraDocumentDialog', () => ({
  ReplaceCollaboraDocumentDialog: (props: unknown) => {
    dialogProps(props);
    return null;
  },
}));

import { CollaboraFramingReplaceConnector } from './CollaboraFramingReplaceConnector';

describe('CollaboraFramingReplaceConnector', () => {
  it('leaves a refused replace to its own inline server error', () => {
    render(
      <CollaboraFramingReplaceConnector
        open={true}
        onOpenChange={() => {}}
        collaboraDocumentId="doc-1"
        currentDocumentType="WORDPROCESSING"
        currentTitle="Doc"
      />
    );

    expect(replaceOptions.mock.calls[0][0].context).toEqual({ skipGlobalErrorHandler: true });
  });

  it("shows the server's reason inline for a refused replace", async () => {
    replace.mockRejectedValueOnce(
      new ApolloError({
        graphQLErrors: [{ message: 'The document is being edited', extensions: { code: 'BAD_USER_INPUT' } }],
      })
    );
    render(
      <CollaboraFramingReplaceConnector
        open={true}
        onOpenChange={() => {}}
        collaboraDocumentId="doc-1"
        currentDocumentType="WORDPROCESSING"
        currentTitle="Doc"
      />
    );
    const latest = () => dialogProps.mock.calls[dialogProps.mock.calls.length - 1][0];

    await act(async () => {
      latest().onFileChange(new File(['x'], 'report.docx'));
    });
    await act(async () => {
      await latest().onConfirm();
    });

    expect(latest().serverErrorMessage).toContain('The document is being edited');
  });
});
