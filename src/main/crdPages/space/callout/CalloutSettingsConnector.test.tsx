import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const sortOrderOptions = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCalloutContentLazyQuery: () => [vi.fn()],
  useCalloutContributionsSortOrderQuery: () => ({ data: undefined, loading: false }),
  useCalloutFormResponsesQuery: () => ({ data: undefined }),
  useSpaceTemplatesManagerQuery: () => ({ data: undefined }),
  useUpdateContributionsSortOrderMutation: (options: unknown) => {
    sortOrderOptions(options);
    return [vi.fn(), { loading: false }];
  },
}));
vi.mock('@/domain/collaboration/callout/utils/useCalloutManager', () => ({
  useCalloutManager: () => ({ changeCalloutVisibility: vi.fn(), deleteCallout: vi.fn() }),
}));
vi.mock('@/domain/space/context/useSpace', () => ({ useSpace: () => ({ space: { levelZeroSpaceId: 'space-1' } }) }));
vi.mock('@/main/crdPages/templates/useSaveAsTemplate', () => ({
  useSaveAsTemplate: () => ({ openSaveAs: vi.fn(), form: {} }),
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/core/logging/sentry/log', () => ({ error: vi.fn() }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('./deriveCalloutMenuVisibility', () => ({ deriveCalloutMenuVisibility: () => ({}) }));
vi.mock('./dataMappers/mapCalloutToDeletionSummary', () => ({ mapCalloutToDeletionSummary: () => ({}) }));
vi.mock('@/crd/components/callout/CalloutContextMenu', () => ({ CalloutContextMenu: () => null }));
vi.mock('@/crd/components/callout/CalloutContributionsSortDialog', () => ({
  CalloutContributionsSortDialog: () => null,
}));
vi.mock('@/crd/components/callout/CalloutVisibilityChangeDialog', () => ({
  CalloutVisibilityChangeDialog: () => null,
}));
vi.mock('@/crd/components/dialogs/DeleteCalloutDialog', () => ({ DeleteCalloutDialog: () => null }));
vi.mock('@/crd/components/templates/TemplateFormDialog', () => ({ TemplateFormDialog: () => null }));
vi.mock('./CalloutEditConnector', () => ({ CalloutEditConnector: () => null }));
vi.mock('./CollaboraFramingReplaceConnector', () => ({ CollaboraFramingReplaceConnector: () => null }));
vi.mock('./TaskBoardColumnsConnector', () => ({ TaskBoardColumnsConnector: () => null }));

import { CalloutSettingsConnector } from './CalloutSettingsConnector';

describe('CalloutSettingsConnector', () => {
  it('leaves a refused contribution sort to its own saveFailed message', () => {
    const callout = {
      id: 'callout-1',
      framing: { profile: { displayName: 'Callout' } },
      settings: { visibility: 'PUBLISHED', contribution: { enabled: true } },
      contributions: [],
    };
    render(<CalloutSettingsConnector callout={callout as never} />);

    expect(sortOrderOptions.mock.calls[0][0].context).toEqual({ skipGlobalErrorHandler: true });
  });
});
