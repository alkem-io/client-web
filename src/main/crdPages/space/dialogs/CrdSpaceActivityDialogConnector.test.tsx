import { ApolloClient, ApolloLink, ApolloProvider, Observable, type Operation } from '@apollo/client';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import type { ActivityItemData } from '@/crd/components/dashboard/ActivityFeed';
import { CrdSpaceActivityDialogConnector } from './CrdSpaceActivityDialogConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));
vi.mock('@/crd/components/dashboard/ActivityDialog', () => ({
  ActivityDialog: ({ open, children }: { open: boolean; children: ReactNode }) => (open ? children : null),
}));
vi.mock('@/crd/components/dashboard/ActivityFeed', () => ({
  ActivityFeed: ({ items }: { items: ActivityItemData[] }) => <output aria-label="feed">{items.length}</output>,
}));

function setup() {
  const sent: Operation[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(operation => {
      sent.push(operation);
      return new Observable(observer => observer.error(new Error('unexpected request')));
    }),
  });
  const view = (open: boolean) => (
    <ApolloProvider client={client}>
      <CrdSpaceActivityDialogConnector open={open} onOpenChange={vi.fn()} spaceId="space" />
    </ApolloProvider>
  );
  const { rerender } = render(view(false));
  return { sent, setOpen: (open: boolean) => rerender(view(open)) };
}

describe('CrdSpaceActivityDialogConnector (021 T016, D7)', () => {
  test('a space activity is not served yet: the open dialog says so once, lists nothing and sends nothing', async () => {
    const { sent, setOpen } = setup();
    expect(screen.queryByText('tabs.unavailable')).not.toBeInTheDocument();
    setOpen(true);
    expect(screen.getAllByText('tabs.unavailable')).toHaveLength(1);
    expect(screen.queryByLabelText('feed')).not.toBeInTheDocument();
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(sent).toEqual([]);
  });
});
