import { Node } from '@tiptap/core';

// We need to declare it explicitly since the iframe option is still in experimental phase.
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    iframe: {
      setIframe: (options: { src: string }) => ReturnType;
    };
  }
}

export type IframeOptions = {
  allowFullscreen: boolean;
  HTMLAttributes: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; // It's any by default, keep it.
  };
};

export const Iframe = Node.create<IframeOptions>({
  name: 'iframe',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: { class: 'iframe-wrapper' },
    };
  },

  addAttributes() {
    return {
      src: { default: null },
      frameborder: { default: 0 },
      allowfullscreen: {
        default: this.options.allowFullscreen,
        parseHTML: () => this.options.allowFullscreen,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'iframe' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', this.options.HTMLAttributes, ['iframe', HTMLAttributes]];
  },

  addCommands() {
    return {
      setIframe:
        (options: { src: string }) =>
        ({ tr, dispatch }) => {
          const { selection } = tr;
          const node = this.type.create(options);

          if (dispatch) {
            tr.replaceRangeWith(selection.from, selection.to, node);
          }

          return true;
        },
    };
  },
});
