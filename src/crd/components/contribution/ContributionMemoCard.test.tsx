import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createInstance } from 'i18next';
import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import spaceEn from '@/crd/i18n/space/space.en.json';
import { ContributionMemoCard } from './ContributionMemoCard';

const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    resources: { en: { 'crd-space': spaceEn } },
    interpolation: { escapeValue: false },
  });
});

const render = (element: ReactElement) => renderBase(<I18nextProvider i18n={i18n}>{element}</I18nextProvider>);

describe('ContributionMemoCard signed copies', () => {
  it('keeps Open memo and Signed copies as visible semantic siblings', async () => {
    const onClick = vi.fn();
    const onOpenSignedCopies = vi.fn();
    const user = userEvent.setup();

    render(
      <ContributionMemoCard
        title="Pilot memo"
        markdownContent="Fixed proposal"
        onClick={onClick}
        {...({ signedCopiesCount: 1, onOpenSignedCopies } as Record<string, unknown>)}
      />
    );

    const openMemo = screen.getByRole('button', { name: 'Open Pilot memo' });
    const history = screen.getByRole('button', { name: 'Signed copies (1)' });
    expect(openMemo.contains(history)).toBe(false);
    expect(history).toBeVisible();

    history.focus();
    await user.keyboard('{Enter}');

    expect(onOpenSignedCopies).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });
});
