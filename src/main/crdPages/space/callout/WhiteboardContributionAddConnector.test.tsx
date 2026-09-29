import { ApolloError } from '@apollo/client';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WhiteboardContributionAddConnector } from './WhiteboardContributionAddConnector';

const state = vi.hoisted(() => ({
  createWhiteboard: vi.fn(),
  handleApolloError: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCreateWhiteboardOnCalloutMutation: () => [state.createWhiteboard],
}));
vi.mock('@/core/apollo/hooks/useApolloErrorHandler', () => ({
  useApolloErrorHandler: () => state.handleApolloError,
}));

describe('WhiteboardContributionAddConnector', () => {
  beforeEach(() => {
    state.createWhiteboard.mockReset();
    state.handleApolloError.mockReset();
  });

  it('surfaces a rejected creation through the Apollo handler while keeping the dialog open', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onCreated = vi.fn();
    const error = new ApolloError({
      errorMessage: 'Whiteboard source-copy references a document outside the authorized source bucket',
    });
    state.createWhiteboard.mockRejectedValue(error);

    render(
      <WhiteboardContributionAddConnector
        calloutId="callout-1"
        open={true}
        onOpenChange={onOpenChange}
        onCreated={onCreated}
      />
    );

    await user.click(screen.getByRole('button', { name: 'dialogs.create' }));

    await waitFor(() => expect(state.handleApolloError).toHaveBeenCalledWith(error));
    expect(state.createWhiteboard).toHaveBeenCalledOnce();
    expect(state.createWhiteboard).toHaveBeenCalledWith({
      context: { skipGlobalErrorHandler: true },
      variables: {
        calloutId: 'callout-1',
        whiteboard: { profile: { displayName: 'callout.defaultWhiteboardName' } },
      },
      refetchQueries: ['CalloutDetails', 'CalloutContributions'],
      awaitRefetchQueries: true,
    });
    expect(onCreated).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
