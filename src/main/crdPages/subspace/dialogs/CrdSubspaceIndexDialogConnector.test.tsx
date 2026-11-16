import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { CrdSubspaceIndexDialogConnector } from './CrdSubspaceIndexDialogConnector';

const callout = (id: string, state: string, sortOrder: number) => ({
  id,
  sortOrder,
  classification: { flowState: { tags: [state] } },
  framing: { profile: { displayName: `Post ${id}`, url: `/post/${id}` } },
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

vi.mock('@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet', () => ({
  default: () => ({
    loading: false,
    callouts: [callout('hidden-1', 'Hidden phase', 0), callout('b-1', 'Phase B', 0), callout('a-1', 'Phase A', 0)],
  }),
}));

describe('CrdSubspaceIndexDialogConnector', () => {
  test('omits callouts of phases that are not visible, keeping visible phases in flow order', () => {
    render(
      <CrdSubspaceIndexDialogConnector
        open={true}
        onOpenChange={() => {}}
        calloutsSetId="callouts-set-1"
        phaseNames={['Phase A', 'Phase B']}
      />
    );

    expect(screen.queryByText('Hidden phase')).toBeNull();
    expect(screen.queryByText('Post hidden-1')).toBeNull();

    const headings = screen.getAllByText(/^Phase [AB]$/).map(el => el.textContent);
    expect(headings).toEqual(['Phase A', 'Phase B']);
    expect(screen.getByText('Post a-1')).toBeTruthy();
    expect(screen.getByText('Post b-1')).toBeTruthy();
  });
});
