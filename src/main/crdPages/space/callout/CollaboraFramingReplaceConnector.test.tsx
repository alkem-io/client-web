import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const replaceOptions = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useReplaceCollaboraDocumentMutation: (options: unknown) => {
    replaceOptions(options);
    return [vi.fn(), { loading: false }];
  },
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/core/logging/sentry/log', () => ({ error: vi.fn() }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/crd/forms/callout/ReplaceCollaboraDocumentDialog', () => ({ ReplaceCollaboraDocumentDialog: () => null }));

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
});
