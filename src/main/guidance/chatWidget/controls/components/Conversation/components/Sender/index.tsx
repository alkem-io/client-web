import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

import { useChatBehavior } from '../../../../context/ChatBehaviorContext';

import { getCaretIndex, isFirefox, updateCaret, insertNodeAtCaret, getSelection } from '../../../../utils';
import send from '../../../../assets/send_button.svg';
import emoji from '../../../../assets/icon-smiley.svg';

const brRegex = /<br>/g;

import { Box, IconButton } from '@mui/material';

type Props = {
  placeholder: string;
  disabledInput: boolean;
  autofocus: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendMessage: (event: any) => void;
  buttonAlt: string;
  onPressEmoji: () => void;
  // onChangeSize: (event: any) => void;
  // onTextInputChange?: (event: any) => void;
};

function Sender(
  {
    sendMessage,
    placeholder,
    disabledInput,
    autofocus,
    buttonAlt,
    onPressEmoji,
    // onTextInputChange,
    // onChangeSize
  }: Props,
  ref
) {
  const {
    state: { showChat },
  } = useChatBehavior();
  const inputRef = useRef<HTMLDivElement>(null!);
  const refContainer = useRef<HTMLDivElement>(null);
  const [enter, setEnter] = useState(false);
  const [firefox, setFirefox] = useState(false);
  const [height, setHeight] = useState(0);
  // @ts-ignore
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

  // const handlerOnChange = (event) => {
  //   onTextInputChange && onTextInputChange(event)
  // }

  const handlerSendMessage = () => {
    const el = inputRef.current;
    if (el.innerHTML) {
      sendMessage(el.innerText);
      el.innerHTML = '';
    }
  };

  const handlerOnSelectEmoji = emoji => {
    const el = inputRef.current;
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

  const handlerOnKeyPress = event => {
    const el = inputRef.current;

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
  };

  const handlerOnKeyUp = event => {
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

  const handlerOnKeyDown = event => {
    const el = inputRef.current;

    if (event.key === 'Backspace' && el) {
      const caretPosition = getCaretIndex(inputRef.current);
      const character = el.innerHTML.charAt(caretPosition - 1);
      if (character === '\n') {
        event.preventDefault();
        event.stopPropagation();
        el.innerHTML = el.innerHTML.substring(0, caretPosition - 1) + el.innerHTML.substring(caretPosition);
        updateCaret(el, caretPosition, -1);
      }
    }
  };

  const handlerPressEmoji = () => {
    onPressEmoji();
    checkSize();
  };

  return (
    <Box
      ref={refContainer}
      sx={{
        alignItems: 'flex-end',
        backgroundColor: theme => theme.palette.grey[200], // $grey-2
        borderRadius: { xs: 0, sm: '0 0 10px 10px' },
        display: 'flex',
        height: 'max-content',
        maxHeight: 95,
        minHeight: 45,
        overflow: 'hidden',
        p: 1.25, // 10px (theme spacing = 8*1.25 = 10)
        position: 'relative',
        '@media (max-width:800px)': {
          borderRadius: 0,
          flexShrink: 0,
        },
      }}
    >
      {/* Emoji Button */}
      <IconButton
        onClick={handlerPressEmoji}
        sx={{
          background: theme => theme.palette.grey[200],
          border: 0,
          p: 1, // default IconButton padding
          cursor: 'pointer',
          mr: 1,
          '&:hover': {
            background: theme => theme.palette.grey[300],
          },
        }}
        type="button"
      >
        <Box
          component="img"
          src={emoji}
          alt=""
          sx={{
            width: 25,
            height: 25,
          }}
        />
      </IconButton>

      {/* Message input container */}
      <Box
        sx={{
          backgroundColor: disabledInput ? theme => theme.palette.grey[200] : 'common.white',
          border: 0,
          borderRadius: '5px',
          px: 0.625, // 5px
          py: 1.25, // 10px
          resize: 'none',
          width: 'calc(100% - 75px)',
          cursor: disabledInput ? 'not-allowed' : 'text',
          transition: 'background 0.2s',
        }}
      >
        <Box
          sx={{
            '& > div': {
              border: 0,
              outline: 'none',
              height: '100%',
              lineHeight: '20px',
              maxHeight: 78,
              overflowY: 'auto',
              userSelect: 'text',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              '&:focus-visible': {
                outline: 'none',
              },
              // Placeholder mimic for contentEditable div when empty
              ...(placeholder
                ? {
                    '&:empty:before': {
                      content: `"${placeholder}"`,
                      color: theme => theme.palette.grey[50], // $grey-0
                      pointerEvents: 'none',
                      opacity: 1,
                    },
                  }
                : {}),
            },
          }}
        >
          <div
            spellCheck
            role="textbox"
            contentEditable={!disabledInput}
            ref={inputRef}
            tabIndex={0}
            onKeyPress={handlerOnKeyPress}
            onKeyUp={handlerOnKeyUp}
            onKeyDown={handlerOnKeyDown}
            style={{ display: 'block' }}
          />
        </Box>
      </Box>

      {/* Send button */}
      <IconButton
        onClick={handlerSendMessage}
        sx={{
          background: theme => theme.palette.grey[200],
          border: 0,
          p: 1,
          ml: 1,
          cursor: 'pointer',
          '&:hover': {
            background: theme => theme.palette.grey[300],
          },
        }}
        type="submit"
        disabled={disabledInput}
      >
        <Box
          component="img"
          src={send}
          alt={buttonAlt}
          sx={{
            height: 25,
            width: 25,
          }}
        />
      </IconButton>
    </Box>
  );
}

export default forwardRef(Sender);
