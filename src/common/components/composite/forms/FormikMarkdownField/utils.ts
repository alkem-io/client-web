import { ContentBlock, ContentState, EditorState } from 'draft-js';
import { last } from 'lodash';

const shouldPad = (block: ContentBlock) => block.getType() === 'unstyled' && block.getText() !== '';

/**
 * Produces a new EditorState by inserting an empty block between each 2 non-empty unstyled blocks
 * to keep consistency between DraftJS and Markdown (the latter "eats" a single newline without producing a paragraph).
 * @param {EditorState} editorState
 * @param {EditorState} prevEditorState
 * @returns {EditorState}
 */
export const padBlocks = (editorState: EditorState, prevEditorState: EditorState): EditorState => {
  const contentState = editorState.getCurrentContent();
  const blocks = contentState.getBlockMap();

  if (blocks.size <= 1) {
    return editorState;
  }

  if (blocks.size < prevEditorState.getCurrentContent().getBlockMap().size) {
    return editorState;
  }

  const paddedBlocks: ContentBlock[] = [];
  // @ts-ignore
  for (const [key, block] of blocks.entries()) {
    const shouldPadAfterPrev = paddedBlocks.length >= 1 && shouldPad(last(paddedBlocks)!);
    const shouldPadBeforeCurrent = shouldPad(block);

    if (shouldPadAfterPrev && shouldPadBeforeCurrent) {
      paddedBlocks.push(
        new ContentBlock({
          key: `padding_${key}`,
          text: '',
          type: 'paragraph',
        }),
        block
      );
    } else {
      paddedBlocks.push(block);
    }
  }

  if (paddedBlocks.length === blocks.size) {
    return editorState;
  }

  return EditorState.push(
    editorState,
    ContentState.createFromBlockArray(paddedBlocks)
      .set('selectionBefore', contentState.getSelectionBefore())
      .set('selectionAfter', contentState.getSelectionAfter()) as ContentState,
    'split-block'
  );
};
