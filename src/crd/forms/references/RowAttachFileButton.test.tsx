import { fireEvent, render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { RowAttachFileButton } from './RowAttachFileButton';

const fileInput = (container: HTMLElement) => container.querySelector('input[type="file"]') as HTMLInputElement;
const pick = (input: HTMLInputElement, files: File[]) => fireEvent.change(input, { target: { files } });

describe('RowAttachFileButton', () => {
  const a = new File(['a'], 'a.pdf');
  const b = new File(['b'], 'b.pdf');

  test('with onFiles: the input takes several files, two go to onFiles in order, one goes to onFile', () => {
    const onFile = vi.fn();
    const onFiles = vi.fn();
    const { container } = render(
      <RowAttachFileButton uploading={false} ariaLabel="attach" onFile={onFile} onFiles={onFiles} />
    );
    const input = fileInput(container);

    expect(input).toHaveAttribute('multiple');

    pick(input, [a, b]);
    expect(onFiles).toHaveBeenCalledWith([a, b]);
    expect(onFile).not.toHaveBeenCalled();

    pick(input, [a]);
    expect(onFile).toHaveBeenCalledWith(a);
    expect(onFiles).toHaveBeenCalledTimes(1);
  });

  test('without onFiles: a single-file input, one file goes to onFile as today', () => {
    const onFile = vi.fn();
    const { container } = render(<RowAttachFileButton uploading={false} ariaLabel="attach" onFile={onFile} />);
    const input = fileInput(container);

    expect(input).not.toHaveAttribute('multiple');
    pick(input, [a]);
    expect(onFile).toHaveBeenCalledWith(a);
  });

  test('the input value is reset after each change so the same file can be picked again', () => {
    const { container } = render(
      <RowAttachFileButton uploading={false} ariaLabel="attach" onFile={vi.fn()} onFiles={vi.fn()} />
    );
    const input = fileInput(container);
    const valueSetter = vi.spyOn(input, 'value', 'set');

    pick(input, [a, b]);
    expect(valueSetter).toHaveBeenCalledWith('');
  });
});
