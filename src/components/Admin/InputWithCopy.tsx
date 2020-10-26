import React, { FC, useState } from 'react';
import { Button, FormControl, FormLabel, InputGroup } from 'react-bootstrap';
import CopyToClipboard from 'react-copy-to-clipboard';

import { ReactComponent as ClipboardIcon } from 'bootstrap-icons/icons/clipboard.svg';
import { ReactComponent as ClipboardCheckIcon } from 'bootstrap-icons/icons/clipboard-check.svg';

interface InputWithCopyProps {
  label?: string;
  text: string;
}

export const InputWithCopy: FC<InputWithCopyProps> = ({ label, text }) => {
  const [isCopied, setCopied] = useState(false);
  return (
    <>
      {label && <FormLabel> {label}</FormLabel>}
      <InputGroup>
        <FormControl value={text} readOnly placeholder={label} aria-label={label} aria-describedby={label} />
        <InputGroup.Append>
          <CopyToClipboard text={text} onCopy={() => setCopied(true)}>
            <Button variant="secondary">{isCopied ? <ClipboardCheckIcon /> : <ClipboardIcon />}</Button>
          </CopyToClipboard>
        </InputGroup.Append>
      </InputGroup>
    </>
  );
};
export default InputWithCopy;
