import { act, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { DIALOG_DISMISS_IGNORE_ATTR, Dialog, DialogContent, DialogTitle } from './dialog';

// An overlay outside the dialog layer (like the chat panel) holding a button that a press removes.
const Page = ({ marked, buttonShown = true }: { marked: boolean; buttonShown?: boolean }) => {
  return (
    <>
      <Dialog defaultOpen={true}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Post</DialogTitle>
        </DialogContent>
      </Dialog>
      <div {...(marked ? { [DIALOG_DISMISS_IGNORE_ATTR]: '' } : {})}>
        {buttonShown && <button type="button">Back</button>}
      </div>
    </>
  );
};

// Browser order of a press that removes what it pressed: pointerdown, the element goes
// (React commits the click's update mid-dispatch), then the click reaches the document.
const press = (pointerType: 'mouse' | 'touch', removePressed: () => void) => {
  const target = screen.getByRole('button', { name: 'Back', hidden: true });
  const down = new MouseEvent('pointerdown', { bubbles: true, cancelable: true });
  Object.defineProperty(down, 'pointerType', { value: pointerType });
  act(() => {
    target.dispatchEvent(down);
  });
  removePressed();
  act(() => {
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
};

const flushRadixListeners = () =>
  act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

test.each([
  'mouse',
  'touch',
] as const)('a %s press in a marked overlay leaves the dialog open, even when it removes the pressed element', async pointerType => {
  const { rerender } = render(<Page marked={true} />);
  await flushRadixListeners();
  press(pointerType, () => rerender(<Page marked={true} buttonShown={false} />));
  expect(screen.queryByRole('button', { name: 'Back', hidden: true })).toBeNull();
  expect(screen.getByRole('dialog', { name: 'Post' })).toBeInTheDocument();
});

test('a touch press outside the dialog, not in a marked overlay, still dismisses it', async () => {
  const { rerender } = render(<Page marked={false} />);
  await flushRadixListeners();
  press('touch', () => rerender(<Page marked={false} buttonShown={false} />));
  expect(screen.queryByRole('dialog', { name: 'Post' })).toBeNull();
});
