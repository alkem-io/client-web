// Wysiwyg Editor toolbar configuration:
// https://jpuri.github.io/react-draft-wysiwyg/#/docs
export const ToolbarConfiguration = {
  options: ['inline', 'blockType', 'list', 'link', 'emoji', 'image'],
  blockType: {
    options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
  },
  inline: {
    // Markdown doesn't support 'underline', strikethrough removed
    options: ['bold', 'italic'],
  },
  list: {
    options: ['unordered', 'ordered'],
  },
  link: {
    showOpenOptionOnHover: true,
    options: ['link'],
  },
  emoji: {},
  image: {
    urlEnabled: true,
    uploadEnabled: true,
    alignmentEnabled: false,
    uploadCallback: () => {}, // Pending
    previewImage: true,
    inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
    alt: { present: false, mandatory: false },
    defaultSize: false,
  },
};

// Toolbar translations:
// See https://jpuri.github.io/react-draft-wysiwyg/#/docs
// And https://github.com/jpuri/react-draft-wysiwyg/blob/master/src/i18n/en.js
export const ToolbarTranslationKeys = [
  'blocktype.h1',
  'blocktype.h2',
  'blocktype.h3',
  'blocktype.h4',
  'blocktype.h5',
  'blocktype.h6',
  'blocktype.blockquote',
  'blocktype.code',
  'blocktype.blocktype',
  'blocktype.normal',
  'emoji.emoji',
  'history.history',
  'history.undo',
  'history.redo',
  'image.image',
  'image.fileUpload',
  'image.byURL',
  'image.dropFileText',
  'inline.bold',
  'inline.italic',
  'inline.strikethrough',
  'inline.monospace',
  'link.linkTitle',
  'link.linkTarget',
  'link.linkTargetOption',
  'link.link',
  'link.unlink',
  'list.list',
  'list.unordered',
  'list.ordered',
  'list.indent',
  'list.outdent',
  'remove.remove',
] as const;
