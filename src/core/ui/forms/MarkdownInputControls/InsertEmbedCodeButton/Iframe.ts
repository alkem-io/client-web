import { Node } from '@tiptap/core';

// We need to declare it explicitly since the iframe option is still in experimental phase.
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    iframe: {
      setIframe: (options: { src: string }) => ReturnType;
    };
  }
}

const defaultIframeAttributes = {
  src: { default: null },
  position: { default: 'absolute' },
  top: { default: 0 },
  left: { default: 0 },
  width: { default: '100%' },
  height: { default: '100%' },
  frameborder: { default: 0 },
  sandbox: { default: 'allow-scripts allow-same-origin allow-popups allow-presentation' },
};

export type IframeOptions = {
  allowFullscreen: boolean;
  HTMLAttributes: {
    [key: string]: string;
  };
};

export const Iframe = Node.create<IframeOptions>({
  name: 'iframe',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      allowFullscreen: true,
      mozallowfullscreen: true,
      webkitallowfullscreen: true,
      HTMLAttributes: {
        class: 'iframe-wrapper',
        style: 'position: relative; height: 442px; width: 100%;',
      },
    };
  },

  addAttributes() {
    return {
      ...defaultIframeAttributes,
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
