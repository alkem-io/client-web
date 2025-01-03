import { Node } from '@tiptap/core';
import { Editor } from '@tiptap/react';
import { forwardRef, memo, useEffect, useState } from 'react';
import {
  Code,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuoteOutlined,
  HorizontalRuleOutlined,
  Redo,
  Title,
  Undo,
} from '@mui/icons-material';
import { Collapse, IconButton, IconButtonProps, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';
import { gutters } from '@/core/ui/grid/utils';
import { ChainedCommands } from '@tiptap/core/dist/packages/core/src/types';
import InsertImageButton from './InsertImageButton';
import ToggleLinkButton from './ToggleLinkButton';
import InsertEmojiButton from './InsertEmojiButton';
import { InsertEmbedCodeButton } from './InsertEmbedCodeButton/InsertEmbedCodeButton';
import produce from 'immer';

type MarkdownInputControlsProps = {
  editor: Editor | null;
  visible?: boolean;
  hideImageOptions?: boolean;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
  temporaryLocation?: boolean;
};

interface ControlsButtonProps extends IconButtonProps {
  editor: Editor | null;
  command: (commandsChain: ChainedCommands) => ChainedCommands;
  specs?: string | [attributes: {}] | [nodeOrMark: string, attributes?: {}];
}

const sanitizeUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    const allowedProtocols = ['http:', 'https:'];
    // 'javascript:' is used to prevent XSS attacks by blocking dangerous protocols
    // eslint-disable-next-line no-script-url
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:'];

    if (!allowedProtocols.includes(parsedUrl.protocol) || dangerousProtocols.some(p => url.toLowerCase().includes(p))) {
      return 'about:blank';
    }

    // Ensure the URL doesn't contain encoded versions of dangerous protocols
    const decodedUrl = decodeURIComponent(url.toLowerCase());
    if (dangerousProtocols.some(p => decodedUrl.includes(p))) {
      return 'about:blank';
    }

    return url;
  } catch (e) {
    return 'about:blank';
  }
};

/*
Tabs component used without real Tabs, because MUI Tabs component has a very useful variant="scrollable"
that adds buttons on the sides of the toolbar when the buttons don't fit in a single row */
const Toolbar = styled(Tabs)(() => ({
  /* Hide scroller buttons when they are disabled. Material puts opacity: 0 and toolbar looks ugly. Better hidden */
  '.MuiTabScrollButton-root.Mui-disabled': {
    display: 'none',
  },
  minHeight: 'auto',
}));

interface ButtonState {
  active?: boolean;
  disabled?: boolean;
}

export const iFrame = Node.create({
  name: 'iFrame',
  group: 'block',
  inline: false,
  atom: true,
  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: '560',
      },
      height: {
        default: '315',
      },
    };
  },
  parseHTML() {
    return [{ tag: 'iframe' }];
  },
  renderHTML({ HTMLAttributes }) {
    const safeAttributes = {
      ...HTMLAttributes,
      src: sanitizeUrl(HTMLAttributes.src),
    };
    return ['iframe', safeAttributes];
  },
});

const ControlsButton = memo(
  ({ editor, command, specs, ...buttonProps }: ControlsButtonProps) => {
    const isActiveArgs = specs && ((typeof specs === 'string' ? [specs] : specs) as Parameters<Editor['isActive']>);

    const getActiveState = () => (isActiveArgs ? editor?.isActive(...isActiveArgs) : false);

    const getDisabledState = () => !editor || !command(editor.can().chain().focus()).run();

    const produceButtonState = (prevState: ButtonState = {}) =>
      produce(prevState, nextState => {
        nextState.active = getActiveState();
        nextState.disabled = getDisabledState();
      });

    const [state, setState] = useState<ButtonState>(produceButtonState());

    const refreshOnEditorUpdate = (editor: Editor) => {
      const handleStateChange = async () => {
        setState(produceButtonState);
      };

      editor.on('transaction', handleStateChange);

      return () => {
        editor.off('transaction', handleStateChange);
      };
    };

    useEffect(() => {
      if (editor) {
        return refreshOnEditorUpdate(editor);
      }
    }, [editor]);

    return (
      <IconButton
        onClick={() => editor && command(editor.chain().focus()).run()}
        disabled={state.disabled}
        color={state.active ? 'secondary' : undefined}
        sx={{ width: gutters(2), height: gutters(2) }}
        {...buttonProps}
      />
    );
  },
  (prevProps, nextProps) => {
    return prevProps.editor === nextProps.editor;
  }
);

const CONTROLS_SHOW_DELAY_MS = 150; // to allow a user to select text by double-click without "jumping"

const MarkdownInputControls = memo(
  forwardRef<HTMLDivElement | null, MarkdownInputControlsProps>(
    (
      { editor, visible = false, hideImageOptions = false, onDialogOpen, onDialogClose, temporaryLocation = false },
      ref
    ) => {
      const [isVisible, setIsVisible] = useState(visible);

      useEffect(() => {
        if (visible) {
          setTimeout(() => {
            setIsVisible(() => visible);
          }, CONTROLS_SHOW_DELAY_MS);
        } else {
          setIsVisible(false);
        }
      }, [visible]);

      return (
        <Collapse in={isVisible} ref={ref}>
          <Toolbar value={false} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
            <ControlsButton editor={editor} command={e => e.undo()}>
              <Undo />
            </ControlsButton>
            <ControlsButton editor={editor} command={e => e.redo()}>
              <Redo />
            </ControlsButton>
            <ControlsButton editor={editor} command={e => e.toggleBold()} specs="bold">
              <FormatBold />
            </ControlsButton>
            <ControlsButton editor={editor} command={e => e.toggleItalic()} specs="italic">
              <FormatItalic />
            </ControlsButton>
            <ControlsButton
              editor={editor}
              command={e => e.toggleHeading({ level: 1 })}
              specs={['heading', { level: 1 }]}
            >
              <Title fontSize="large" />
            </ControlsButton>
            <ControlsButton
              editor={editor}
              command={e => e.toggleHeading({ level: 2 })}
              specs={['heading', { level: 2 }]}
            >
              <Title />
            </ControlsButton>
            <ControlsButton
              editor={editor}
              command={e => e.toggleHeading({ level: 3 })}
              specs={['heading', { level: 3 }]}
            >
              <Title fontSize="small" />
            </ControlsButton>
            <ControlsButton editor={editor} command={e => e.toggleBulletList()} specs="bulletList">
              <FormatListBulleted />
            </ControlsButton>
            <ControlsButton editor={editor} command={e => e.toggleOrderedList()} specs="orderedList">
              <FormatListNumbered />
            </ControlsButton>
            <ControlsButton editor={editor} command={e => e.toggleBlockquote()} specs="blockquote">
              <FormatQuoteOutlined />
            </ControlsButton>
            <ControlsButton editor={editor} command={e => e.toggleCodeBlock()} specs="codeBlock">
              <Code />
            </ControlsButton>
            <ControlsButton editor={editor} command={e => e.setHorizontalRule()}>
              <HorizontalRuleOutlined />
            </ControlsButton>
            <ToggleLinkButton editor={editor} onDialogOpen={onDialogOpen} onDialogClose={onDialogClose} />
            {!hideImageOptions && (
              <InsertImageButton
                editor={editor}
                onDialogOpen={onDialogOpen}
                onDialogClose={onDialogClose}
                temporaryLocation={temporaryLocation}
              />
            )}

            <InsertEmbedCodeButton editor={editor} onDialogOpen={onDialogOpen} onDialogClose={onDialogClose} />

            <InsertEmojiButton editor={editor} onDialogOpen={onDialogOpen} onDialogClose={onDialogClose} />
          </Toolbar>
        </Collapse>
      );
    }
  )
);

export default MarkdownInputControls;
