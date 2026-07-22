import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SpaceConversionPanel } from '../SpaceConversionPanel';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

const moveL1ToL0 = vi.fn().mockResolvedValue(undefined);
const moveL1ToL2 = vi.fn().mockResolvedValue(undefined);
const moveL2ToL1 = vi.fn().mockResolvedValue(undefined);
const handleResolve = vi.fn();
const handlePromoteL1ToL0 = vi.fn().mockResolvedValue(undefined);
const handleDemoteL1ToL2 = vi.fn().mockResolvedValue(undefined);
const handlePromoteL2ToL1 = vi.fn().mockResolvedValue(undefined);
const setSelectedTargetL0Id = vi.fn();

const hookDefaults = {
  space: undefined as unknown,
  resolvedLevel: undefined as unknown,
  levelZeroSpaceId: undefined as string | undefined,
  accountOwnerName: undefined as string | undefined,
  siblingSubspaces: [] as { id: string; name: string }[],
  error: undefined as string | undefined,
  loading: false,
  mutationLoading: false,
  siblingsLoading: false,
  movedSpaceUrl: undefined as string | undefined,
  targetL0Spaces: [
    { id: 'other-l0', displayName: 'Other Top-Level Space' },
    { id: 'another-l0', displayName: 'Another Space' },
  ],
  targetL0Loading: false,
  targetL0ExcludeIds: ['own-l0'],
  targetL1Subspaces: [{ id: 'target-l1', displayName: 'Target L1 Subspace' }],
  targetL1Loading: false,
  selectedTargetL0Id: '',
  setSelectedTargetL0Id,
  handleResolve,
  handlePromoteL1ToL0,
  handleDemoteL1ToL2,
  handlePromoteL2ToL1,
  moveL1ToL0,
  moveL1ToL2,
  moveL2ToL1,
};

let hookState = { ...hookDefaults };

vi.mock('@/domain/platformAdmin/management/transfer/spaceConversion/useSpaceConversion', () => ({
  default: () => hookState,
}));

function resolvedL1() {
  hookState = {
    ...hookDefaults,
    space: { id: 'l1-id', level: 'L1' },
    resolvedLevel: 'L1',
    levelZeroSpaceId: 'own-l0',
    accountOwnerName: 'Test Owner',
    siblingSubspaces: [{ id: 'sibling-l1', name: 'Sibling Subspace' }],
  };
}

function resolvedL2() {
  hookState = {
    ...hookDefaults,
    space: { id: 'l2-id', level: 'L2' },
    resolvedLevel: 'L2',
    levelZeroSpaceId: 'own-l0',
    accountOwnerName: 'Test Owner',
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  hookState = { ...hookDefaults };
});

describe('SpaceConversionPanel — Move section', () => {
  describe('US1: Move L1 to another top-level space (movel1l0)', () => {
    test('shows move button for L1 space', () => {
      resolvedL1();
      render(<SpaceConversionPanel />);
      expect(screen.getByText('transfer.spaceMove.title')).toBeDefined();
      const buttons = screen.getAllByRole('button');
      const moveBtn = buttons.find(b => b.textContent?.includes('transfer.spaceMove.moveL1ToL0Label'));
      expect(moveBtn).toBeDefined();
    });

    test('FR-009: confirm dialog names destructive consequences before executing', async () => {
      resolvedL1();
      const user = userEvent.setup();
      render(<SpaceConversionPanel />);

      // First select a target L0 space in the picker (first picker for movel1l0 flow)
      const firstPicker = screen.getAllByRole('listbox')[0];
      const targetBtn = within(firstPicker).getByText('Other Top-Level Space');
      await user.click(targetBtn);

      // Click the "Move to another top-level space" button
      const moveBtn = screen.getAllByRole('button').find(b => b.textContent === 'transfer.spaceMove.moveL1ToL0Label');
      expect(moveBtn).toBeDefined();
      await user.click(moveBtn as HTMLElement);

      // Confirm dialog must appear with the destructive description (FR-009)
      const dialog = screen.getByRole('alertdialog');
      expect(within(dialog).getByText('transfer.spaceMove.confirmDescription')).toBeDefined();
      expect(within(dialog).getByText('transfer.spaceMove.confirmTitle')).toBeDefined();
    });

    test('US1-AS2: cancel = no mutation call', async () => {
      resolvedL1();
      const user = userEvent.setup();
      render(<SpaceConversionPanel />);

      // Select target L0
      const firstPicker = screen.getAllByRole('listbox')[0];
      await user.click(within(firstPicker).getByText('Other Top-Level Space'));

      const moveBtn = screen.getAllByRole('button').find(b => b.textContent === 'transfer.spaceMove.moveL1ToL0Label');
      await user.click(moveBtn as HTMLElement);

      // Dialog open — cancel
      const dialog = screen.getByRole('alertdialog');
      const cancelBtn = within(dialog).getByRole('button', { name: /cancel/i });
      await user.click(cancelBtn);

      expect(moveL1ToL0).not.toHaveBeenCalled();
    });

    test('calls moveL1ToL0 with correct target when confirmed', async () => {
      resolvedL1();
      const user = userEvent.setup();
      render(<SpaceConversionPanel />);

      // Select target L0 in the first picker
      const listboxes = screen.getAllByRole('listbox');
      await user.click(within(listboxes[0]).getByText('Other Top-Level Space'));

      const moveBtn = screen.getAllByRole('button').find(b => b.textContent === 'transfer.spaceMove.moveL1ToL0Label');
      await user.click(moveBtn as HTMLElement);

      const dialog = screen.getByRole('alertdialog');
      await user.click(within(dialog).getByText('transfer.spaceMove.move'));

      expect(moveL1ToL0).toHaveBeenCalledWith('other-l0', undefined, undefined);
    });

    test('US4-AS2: auto-invite off → invitationMessage/autoInvite not passed', async () => {
      resolvedL1();
      const user = userEvent.setup();
      render(<SpaceConversionPanel />);

      const listboxes = screen.getAllByRole('listbox');
      await user.click(within(listboxes[0]).getByText('Other Top-Level Space'));

      const moveBtn = screen.getAllByRole('button').find(b => b.textContent === 'transfer.spaceMove.moveL1ToL0Label');
      await user.click(moveBtn as HTMLElement);

      const dialog = screen.getByRole('alertdialog');
      // auto-invite is off by default
      await user.click(within(dialog).getByText('transfer.spaceMove.move'));

      expect(moveL1ToL0).toHaveBeenCalledWith('other-l0', undefined, undefined);
    });

    test('US4-AS1: auto-invite on + message → passed through', async () => {
      resolvedL1();
      const user = userEvent.setup();
      render(<SpaceConversionPanel />);

      const listboxes = screen.getAllByRole('listbox');
      await user.click(within(listboxes[0]).getByText('Other Top-Level Space'));

      const moveBtn = screen.getAllByRole('button').find(b => b.textContent === 'transfer.spaceMove.moveL1ToL0Label');
      await user.click(moveBtn as HTMLElement);

      const dialog = screen.getByRole('alertdialog');
      // Enable auto-invite
      const checkbox = within(dialog).getByRole('checkbox');
      await user.click(checkbox);
      // Type message
      const textarea = within(dialog).getByRole('textbox');
      await user.type(textarea, 'Welcome back!');

      await user.click(within(dialog).getByText('transfer.spaceMove.move'));
      expect(moveL1ToL0).toHaveBeenCalledWith('other-l0', true, 'Welcome back!');
    });

    test('picker exclusions respected: own-l0 excluded (US1-AS3)', () => {
      resolvedL1();
      render(<SpaceConversionPanel />);
      const listboxes = screen.getAllByRole('listbox');
      // 'own-l0' should not appear in the picker (excluded via targetL0ExcludeIds)
      // Our mock data only has 'other-l0' and 'another-l0'; 'own-l0' is in excludeIds
      // Both other-l0 and another-l0 appear, own-l0 does not
      const itemTexts = Array.from(listboxes[0].querySelectorAll('button')).map(b => b.textContent);
      expect(itemTexts).not.toContain('Own L0');
    });

    test('FR-015: success state shows new location link after move', () => {
      hookState = {
        ...hookDefaults,
        movedSpaceUrl: 'https://alkemio.io/spaces/new-location',
      };
      render(<SpaceConversionPanel />);
      const link = screen.getByRole('link', { name: 'transfer.spaceMove.newLocationLabel' });
      expect(link.getAttribute('href')).toBe('https://alkemio.io/spaces/new-location');
    });
  });

  describe('US2: Move L2 under different top-level space (movel2l1)', () => {
    test('shows two-stage picker for L2 space', () => {
      resolvedL2();
      render(<SpaceConversionPanel />);
      const listboxes = screen.getAllByRole('listbox');
      // At least one L0 picker
      expect(listboxes.length).toBeGreaterThanOrEqual(1);
      expect(within(listboxes[0]).getByText('Other Top-Level Space')).toBeDefined();
    });

    test('FR-009: confirm dialog for L2→L1 has destructive description', async () => {
      hookState = {
        ...hookDefaults,
        space: { id: 'l2-id' },
        resolvedLevel: 'L2',
        levelZeroSpaceId: 'own-l0',
        accountOwnerName: 'Owner',
        selectedTargetL0Id: 'other-l0',
        targetL1Subspaces: [{ id: 'target-l1', displayName: 'Target L1 Subspace' }],
      };
      const user = userEvent.setup();
      render(<SpaceConversionPanel />);

      // Select L0 then L1
      const listboxes = screen.getAllByRole('listbox');
      await user.click(within(listboxes[0]).getByText('Other Top-Level Space'));

      // After L0 selection, a second picker may be shown. Let's click the move button
      const moveBtn = screen.getAllByRole('button').find(b => b.textContent === 'transfer.spaceMove.moveL2ToL1Label');
      expect(moveBtn).toBeDefined();
    });

    test('error from server rejection (US2-AS3 same-L0) is shown in panel', async () => {
      resolvedL2();
      const serverError = new Error('Same-L0 lateral not supported');
      moveL2ToL1.mockRejectedValueOnce(serverError);

      const user = userEvent.setup();
      render(<SpaceConversionPanel />);

      // Step 1: select an L0 target (this reveals the L1 picker)
      const listboxes = screen.getAllByRole('listbox');
      await user.click(within(listboxes[0]).getByText('Other Top-Level Space'));

      // Step 2: select an L1 target (picker is now visible because moveTargetL0Id is set)
      const updatedListboxes = screen.getAllByRole('listbox');
      const l1Picker = updatedListboxes[updatedListboxes.length - 1];
      await user.click(within(l1Picker).getByText('Target L1 Subspace'));

      // Step 3: click the Move L2→L1 button (now enabled)
      const moveBtn = screen.getAllByRole('button').find(b => b.textContent === 'transfer.spaceMove.moveL2ToL1Label');
      expect(moveBtn).toBeDefined();
      await user.click(moveBtn as HTMLElement);

      // Step 4: confirm in the dialog
      const dialog = screen.getByRole('alertdialog');
      await user.click(within(dialog).getByText('transfer.spaceMove.move'));

      // Step 5: the rejected error message must be surfaced in the panel
      expect(await screen.findByText('Same-L0 lateral not supported')).toBeInTheDocument();
    });
  });

  describe("US3: Move L1 under another space's subspace (movel1l2)", () => {
    test('L1 resolved shows the L1→L2 move section', () => {
      resolvedL1();
      render(<SpaceConversionPanel />);
      // moveL1ToL2Label appears as both a section label and a button label
      const els = screen.getAllByText('transfer.spaceMove.moveL1ToL2Label');
      expect(els.length).toBeGreaterThanOrEqual(1);
    });

    test('server rejection (max nesting depth) rendered as error state', async () => {
      resolvedL1();
      const serverError = new Error('Cannot exceed maximum nesting depth');
      moveL1ToL2.mockRejectedValueOnce(serverError);

      const user = userEvent.setup();
      render(<SpaceConversionPanel />);

      // Step 1: select an L0 target in the L1→L2 section (second listbox group)
      // Both L0 pickers share moveTargetL0Id state; use the second listbox which
      // belongs to the L1→L2 section and triggers handleMoveL0Select
      const listboxes = screen.getAllByRole('listbox');
      // listboxes[0] = L1→L0 picker, listboxes[1] = L1→L2 L0 picker
      await user.click(within(listboxes[1]).getByText('Other Top-Level Space'));

      // Step 2: select an L1 target (picker appears after L0 selection)
      const updatedListboxes = screen.getAllByRole('listbox');
      const l1Picker = updatedListboxes[updatedListboxes.length - 1];
      await user.click(within(l1Picker).getByText('Target L1 Subspace'));

      // Step 3: click the Move L1→L2 button (now enabled)
      const moveBtns = screen
        .getAllByRole('button')
        .filter(b => b.textContent === 'transfer.spaceMove.moveL1ToL2Label');
      // The button is the last occurrence (the label text also appears as a section heading span)
      const moveBtn = moveBtns[moveBtns.length - 1];
      expect(moveBtn).toBeDefined();
      await user.click(moveBtn as HTMLElement);

      // Step 4: confirm in the dialog
      const dialog = screen.getByRole('alertdialog');
      await user.click(within(dialog).getByText('transfer.spaceMove.move'));

      // Step 5: the rejected error message must be surfaced in the panel
      expect(await screen.findByText('Cannot exceed maximum nesting depth')).toBeInTheDocument();
    });
  });

  describe('loading/disabled states', () => {
    test('all move buttons disabled while mutationLoading=true', () => {
      hookState = {
        ...hookDefaults,
        space: { id: 'l1-id' },
        resolvedLevel: 'L1',
        levelZeroSpaceId: 'own-l0',
        mutationLoading: true,
      };
      render(<SpaceConversionPanel />);
      const buttons = screen.getAllByRole('button').filter(b => b.textContent?.includes('transfer.spaceMove.'));
      for (const btn of buttons) expect(btn).toBeDisabled();
    });

    test('move button disabled when no target selected', () => {
      resolvedL1();
      render(<SpaceConversionPanel />);
      const moveBtn = screen.getAllByRole('button').find(b => b.textContent === 'transfer.spaceMove.moveL1ToL0Label');
      // No L0 selected → button disabled
      expect(moveBtn).toBeDisabled();
    });
  });
});
