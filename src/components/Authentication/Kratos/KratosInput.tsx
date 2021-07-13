import { UiNodeInputAttributes } from '@ory/kratos-client';
import { ReactComponent as EyeSlash } from 'bootstrap-icons/icons/eye-slash.svg';
import { ReactComponent as Eye } from 'bootstrap-icons/icons/eye.svg';
import React, { FC, useMemo, useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import Icon from '../../core/Icon';
import IconButton from '../../core/IconButton';
import { Required } from '../../Required';
import { getNodeName, getNodeTitle, getNodeValue, isInvalidNode, isRequired } from './helpers';
import KratosFeedback from './KratosFeedback';
import { KratosInputExtraProps, KratosProps } from './KratosProps';

interface KratosInputProps extends KratosProps, KratosInputExtraProps {}

export const KratosInput: FC<KratosInputProps> = ({ node, autoCapitalize, autoCorrect, autoComplete }) => {
  const attributes = useMemo(() => node.attributes as UiNodeInputAttributes, [node]);
  const [value, setValue] = useState(getNodeValue(node));
  const [touched, setTouched] = useState(false);
  const [inputType, setInputType] = useState(attributes.type);
  const isPassword = useMemo(() => attributes.type === 'password', [attributes]);

  const invalid = isInvalidNode(node) || (touched && !value);
  const name = getNodeName(node);
  const required = isRequired(node);

  return (
    <Form.Group>
      <Form.Label>
        {getNodeTitle(node)}
        {required && <Required />}
      </Form.Label>
      <InputGroup>
        <Form.Control
          name={name}
          type={inputType}
          value={value ? String(value) : ''}
          onChange={e => setValue(e.target.value)}
          onBlur={() => setTouched(true)}
          required={required}
          disabled={attributes.disabled}
          isInvalid={invalid}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          autoCapitalize={autoCapitalize}
          /*aria-labelledby={} TODO */
        />
        {isPassword && (
          <InputGroup.Append>
            <InputGroup.Text>
              <IconButton onClick={() => setInputType(inputType === 'password' ? 'text' : 'password')}>
                <Icon component={inputType === 'password' ? Eye : EyeSlash} color="inherit" size={'xs'} />
              </IconButton>
            </InputGroup.Text>
          </InputGroup.Append>
        )}
        <Form.Control.Feedback type="invalid">{'This field is required'}</Form.Control.Feedback>
        <KratosFeedback node={node} />
      </InputGroup>
    </Form.Group>
  );
};
export default KratosInput;
