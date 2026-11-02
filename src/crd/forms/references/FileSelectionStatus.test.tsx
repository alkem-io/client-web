import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18next from 'i18next';
import type { ReactElement } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import commonEnJson from '@/crd/i18n/common/common.en.json';
import { FileSelectionStatus } from './FileSelectionStatus';

const i18n = i18next.createInstance();

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['crd-common'],
    defaultNS: 'crd-common',
    resources: { en: { 'crd-common': commonEnJson } },
    interpolation: { escapeValue: false },
  });
});

const renderStatus = (ui: ReactElement) => render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

describe('FileSelectionStatus', () => {
  test('lists each pending file with a spinner', () => {
    renderStatus(
      <FileSelectionStatus
        pending={[
          { key: 'a', name: 'alpha.pdf' },
          { key: 'b', name: 'beta.pdf' },
        ]}
        leftOut={[]}
        onDismiss={vi.fn()}
      />
    );

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('alpha.pdf');
    expect(items[0].querySelector('.animate-spin')).not.toBeNull();
    expect(items[1]).toHaveTextContent('beta.pdf');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('names every left-out file with its reason under a plural heading', () => {
    renderStatus(
      <FileSelectionStatus
        pending={[]}
        leftOut={[
          { name: 'big.pdf', reason: { kind: 'size', maxBytes: 10 * 1024 * 1024 } },
          { name: 'odd.exe', reason: { kind: 'type' } },
          { name: 'many.pdf', reason: { kind: 'limit' } },
          { name: 'broken.pdf', reason: { kind: 'failed' } },
        ]}
        onDismiss={vi.fn()}
      />
    );

    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent('4 files were not added');
    expect(notice).toHaveTextContent('big.pdf');
    expect(notice).toHaveTextContent('larger than 10 MB');
    expect(notice).toHaveTextContent('odd.exe');
    expect(notice).toHaveTextContent(commonEnJson.fileSelection.reason.type);
    expect(notice).toHaveTextContent('many.pdf');
    expect(notice).toHaveTextContent(commonEnJson.fileSelection.reason.limit);
    expect(notice).toHaveTextContent('broken.pdf');
    expect(notice).toHaveTextContent(commonEnJson.fileSelection.reason.failed);
  });

  test('uses the singular heading for one file', () => {
    renderStatus(
      <FileSelectionStatus pending={[]} leftOut={[{ name: 'x.pdf', reason: { kind: 'type' } }]} onDismiss={vi.fn()} />
    );
    expect(screen.getByRole('status')).toHaveTextContent('1 file was not added');
  });

  test('the dismiss button calls onDismiss', async () => {
    const onDismiss = vi.fn();
    renderStatus(
      <FileSelectionStatus pending={[]} leftOut={[{ name: 'x.pdf', reason: { kind: 'type' } }]} onDismiss={onDismiss} />
    );
    await userEvent.click(screen.getByRole('button', { name: commonEnJson.fileSelection.dismiss }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('renders nothing when both lists are empty', () => {
    const { container } = renderStatus(<FileSelectionStatus pending={[]} leftOut={[]} onDismiss={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
