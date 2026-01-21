import { useRef, useEffect, useState, useImperativeHandle } from 'react';
import { ReactNode } from 'react';

import { useChatBehavior } from '../../../context/ChatBehaviorContext';

import { getCaretIndex, isFirefox, updateCaret, insertNodeAtCaret, getSelection } from '../../../utils';

const brRegex = /<br>/g;

import { Box, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { gutters } from '@/core/ui/grid/utils';
import { ISenderRef } from '../Conversation';
import { useTranslation } from 'react-i18next';

type Props = {
  placeholder: string;
  disabledInput: boolean;
  autofocus: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendMessage: (event: any) => void;
  buttonAlt: string;
  menuButton?: ReactNode;
  ref?: React.Ref<ISenderRef>;
};

function Sender({ sendMessage, placeholder, disabledInput, autofocus, buttonAlt, menuButton, ref }: Props) {
  const { t } = useTranslation();
  const {
    state: { showChat },
  } = useChatBehavior();
  const inputRef = useRef<HTMLDivElement | null>(null);
  const refContainer = useRef<HTMLDivElement>(null);
  const [enter, setEnter] = useState(false);
  const [firefox, setFirefox] = useState(false);
  const [height, setHeight] = useState(0);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    if (showChat && autofocus) inputRef.current?.focus();
  }, [showChat, autofocus]);
  useEffect(() => {
    setFirefox(isFirefox());
  }, []);

  useImperativeHandle(ref, () => {
    return {
      onSelectEmoji: handlerOnSelectEmoji,
    };
  });

  const handlerSendMessage = () => {
    const el = inputRef.current;
    if (el && el.innerHTML) {
      sendMessage(el.innerText);
      el.innerHTML = '';
      setHasContent(false);
    }
  };

  const handlerOnSelectEmoji = (emoji: { native: string }) => {
    const el = inputRef.current;
    if (!el) return;

    const { start, end } = getSelection(el);
    if (el.innerHTML) {
      const firstPart = el.innerHTML.substring(0, start);
      const secondPart = el.innerHTML.substring(end);
      el.innerHTML = `${firstPart}${emoji.native}${secondPart}`;
    } else {
      el.innerHTML = emoji.native;
    }
    updateCaret(el, start, emoji.native.length);
  };

  const handlerOnKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const el = inputRef.current;
    if (!el) return;

    if (event.charCode == 13 && !event.shiftKey) {
      event.preventDefault();
      handlerSendMessage();
    }
    if (event.charCode === 13 && event.shiftKey) {
      event.preventDefault();
      insertNodeAtCaret(el);
      setEnter(true);
    }
  };

  // TODO use a context for checkSize and toggle picker
  const checkSize = () => {
    const senderEl = refContainer.current;
    if (senderEl && height !== senderEl.clientHeight) {
      const { clientHeight } = senderEl;
      setHeight(clientHeight);
      // onChangeSize(clientHeight ? clientHeight -1 : 0)
    }

    // Check if input has content
    const el = inputRef.current;
    if (el) {
      const content = el.innerText?.trim() || '';
      setHasContent(content.length > 0);
    }
  };

  const handlerOnKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const el = inputRef.current;
    if (!el) return true;
    // Conditions need for firefox
    if (firefox && event.key === 'Backspace') {
      if (el.innerHTML.length === 1 && enter) {
        el.innerHTML = '';
        setEnter(false);
      } else if (brRegex.test(el.innerHTML)) {
        el.innerHTML = el.innerHTML.replace(brRegex, '');
      }
    }
    checkSize();
  };

  const handlerOnKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const el = inputRef.current;

    if (event.key === 'Backspace' && el) {
      const caretPosition = getCaretIndex(el);
      const character = el.innerHTML.charAt(caretPosition - 1);
      if (character === '\n') {
        event.preventDefault();
        event.stopPropagation();
        el.innerHTML = el.innerHTML.substring(0, caretPosition - 1) + el.innerHTML.substring(caretPosition);
        updateCaret(el, caretPosition, -1);
      }
    }
  };

  return (
    <Box
      ref={refContainer}
      sx={theme => ({
        alignItems: 'center',
        borderRadius: 0,
        backgroundColor: '#f4f7f9',
        display: 'flex',
        height: 'max-content',
        maxHeight: 95,
        minHeight: 45,
        overflow: 'hidden',
        padding: '10px',
        position: 'relative',
        ...theme.typography.body1,
        border: `1px solid ${theme.palette.divider}`,
        flexGrow: 1,
        flexShrink: 1,
        webkitBoxAlign: 'center',
        '@media (max-width:800px)': {
          borderRadius: 0,
          flexShrink: 0,
        },
      })}
    >
      {/* Menu Button */}
      {menuButton && <Box sx={{ mr: 1 }}>{menuButton}</Box>}

      {/* Message input container */}
      <Box
        sx={theme => ({
          backgroundColor: disabledInput ? theme.palette.grey[200] : theme.palette.common.white,
          border: '1px solid #D3D3D3',
          borderRadius: '12px',
          px: '5px',
          py: '10px',
          resize: 'none',
          flexGrow: 1,
          width: 'calc(100% - 75px)',
          cursor: disabledInput ? 'not-allowed' : 'text',
          transition: 'background 0.2s',
        })}
      >
        <Box
          component="div"
          spellCheck
          role="textbox"
          contentEditable={!disabledInput}
          aria-label={t('messaging.message')}
          ref={inputRef}
          tabIndex={0}
          onKeyPress={handlerOnKeyPress}
          onKeyUp={handlerOnKeyUp}
          onKeyDown={handlerOnKeyDown}
          sx={theme => ({
            display: 'block',
            height: '100%',
            lineHeight: `calc(${gutters()(theme)} - 2px)`,
            maxHeight: 78,
            overflowY: 'auto',
            userSelect: 'text',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            outline: 'none',
            '&:focus-visible': {
              outline: 'none',
            },
            ...(placeholder && {
              '&:empty:before': {
                content: `"${placeholder}"`,
                color: '#808080',
                pointerEvents: 'none',
                opacity: 1,
              },
            }),
            cursor: disabledInput ? 'not-allowed' : 'text',
          })}
        />
      </Box>

      <IconButton
        onClick={handlerSendMessage}
        sx={{
          paddingTop: '4px',
          cursor: disabledInput ? 'not-allowed' : 'pointer',
          color: theme => (hasContent ? theme.palette.primary.main : theme.palette.muted.main),
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }}
        type="submit"
        disabled={disabledInput}
        aria-label={buttonAlt}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
}

export default Sender;
