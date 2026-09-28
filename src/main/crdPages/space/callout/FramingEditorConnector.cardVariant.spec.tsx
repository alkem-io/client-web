/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { FramingEditorConnector } from './FramingEditorConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const baseProps = {
  linkUrl: '',
  onLinkUrlChange: vi.fn(),
  linkDisplayName: '',
  onLinkDisplayNameChange: vi.fn(),
  pollQuestion: '',
  onPollQuestionChange: vi.fn(),
  pollOptions: [],
  onPollOptionsChange: vi.fn(),
  mediaGalleryVisuals: [],
  onMediaGalleryVisualsChange: vi.fn(),
  collaboraDocumentType: CollaboraDocumentType.Wordprocessing,
  onCollaboraDocumentTypeChange: vi.fn(),
};

/**
 * The "Expanded card" switch must sit immediately after the
 * complete Manual selection block (its switch, description and, when on, its
 * picker), and must be absent for every non-spaces framing.
 */
describe('FramingEditorConnector — card variant switch placement', () => {
  it('follows the selection switch in DOM order when Manual selection is off', () => {
    render(<FramingEditorConnector {...baseProps} framingType="spaces" />);
    const switches = screen.getAllByRole('switch');
    // First switch = Manual selection ("forms.selection.label"), second = Expanded card.
    expect(switches).toHaveLength(2);
    expect(switches[0]).toHaveAccessibleName('forms.selection.label');
    expect(switches[1]).toHaveAccessibleName('forms.cardVariant.label');
  });

  it('follows the whole selection block (including the picker) when Manual selection is on', () => {
    render(<FramingEditorConnector {...baseProps} framingType="spaces" selectionMode="custom" />);
    const switches = screen.getAllByRole('switch');
    expect(switches).toHaveLength(2);
    expect(switches[1]).toHaveAccessibleName('forms.cardVariant.label');
    // The picker's search box (rendered only in custom mode) precedes the card-variant switch.
    const searchBox = screen.getByRole('textbox', { name: 'forms.selection.searchSubspaceAriaLabel' });
    expect(searchBox.compareDocumentPosition(switches[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows the description verbatim and reflects the stored expanded state', () => {
    render(<FramingEditorConnector {...baseProps} framingType="spaces" cardVariant="expanded" />);
    expect(screen.getByText('forms.cardVariant.description')).toBeInTheDocument();
    const switches = screen.getAllByRole('switch');
    expect(switches[1]).toBeChecked();
  });

  it('calls onCardVariantChange with the plain variant, not a boolean', () => {
    const onCardVariantChange = vi.fn();
    render(<FramingEditorConnector {...baseProps} framingType="spaces" onCardVariantChange={onCardVariantChange} />);
    const switches = screen.getAllByRole('switch');
    switches[1].click();
    expect(onCardVariantChange).toHaveBeenCalledWith('expanded');
  });

  it('is absent for the contributors chip', () => {
    render(
      <FramingEditorConnector
        {...baseProps}
        framingType="contributors"
        contributorCollection={{ types: ['user'], defaultType: 'user', defaultView: 'list' }}
        onContributorCollectionChange={vi.fn()}
      />
    );
    expect(screen.queryByText('forms.cardVariant.label')).toBeNull();
  });

  it('is absent for the whiteboard chip', () => {
    render(<FramingEditorConnector {...baseProps} framingType="whiteboard" />);
    expect(screen.queryByText('forms.cardVariant.label')).toBeNull();
  });
});
