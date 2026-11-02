import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { DocumentImportZone, type DocumentImportZoneProps } from './DocumentImportZone';

const a = new File(['a'], 'a.docx');
const b = new File(['b'], 'b.docx');

const renderZone = (props: Partial<DocumentImportZoneProps> = {}) => {
  const onChange = vi.fn();
  const onError = vi.fn();
  const utils = render(
    <DocumentImportZone
      acceptAttr=".docx"
      value={null}
      onChange={onChange}
      onError={onError}
      error={null}
      errorMessage={null}
      labelHint="hint"
      labelMaxSize="max"
      labelRemoveFile="remove"
      {...props}
    />
  );
  const input = utils.container.querySelector('input[type="file"]') as HTMLInputElement;
  const zone = screen.getByRole('button', { name: 'hint' });
  return { onChange, onError, input, zone };
};

const drop = (zone: HTMLElement, files: File[], items?: unknown[]) =>
  fireEvent.drop(zone, { dataTransfer: { files, items: items ?? files.map(() => ({ webkitGetAsEntry: () => null })) } });

describe('DocumentImportZone with onFiles', () => {
  test('the input takes several files; picked and dropped pairs reach onFiles without an error', () => {
    const onFiles = vi.fn();
    const { input, zone, onError, onChange } = renderZone({ onFiles });

    expect(input).toHaveAttribute('multiple');

    fireEvent.change(input, { target: { files: [a, b] } });
    expect(onFiles).toHaveBeenLastCalledWith([a, b]);

    drop(zone, [a, b]);
    expect(onFiles).toHaveBeenCalledTimes(2);
    expect(onFiles).toHaveBeenLastCalledWith([a, b]);

    expect(onError).not.toHaveBeenCalledWith({ kind: 'multiple-files' });
    expect(onChange).not.toHaveBeenCalled();
  });

  test('one file still goes to onChange', () => {
    const onFiles = vi.fn();
    const { input, onChange } = renderZone({ onFiles });

    fireEvent.change(input, { target: { files: [a] } });
    expect(onChange).toHaveBeenCalledWith(a);
    expect(onFiles).not.toHaveBeenCalled();
  });

  test('a folder drop is refused as today', () => {
    const onFiles = vi.fn();
    const { zone, onError } = renderZone({ onFiles });

    drop(zone, [a, b], [{ webkitGetAsEntry: () => ({ isDirectory: true }) }]);
    expect(onError).toHaveBeenCalledWith({ kind: 'folder' });
    expect(onFiles).not.toHaveBeenCalled();
  });
});

describe('DocumentImportZone without onFiles', () => {
  test('a single-file input that refuses two files as today', () => {
    const { input, zone, onError, onChange } = renderZone();

    expect(input).not.toHaveAttribute('multiple');

    fireEvent.change(input, { target: { files: [a, b] } });
    expect(onError).toHaveBeenCalledWith({ kind: 'multiple-files' });

    drop(zone, [a, b]);
    expect(onError).toHaveBeenLastCalledWith({ kind: 'multiple-files' });
    expect(onChange).not.toHaveBeenCalled();
  });
});
