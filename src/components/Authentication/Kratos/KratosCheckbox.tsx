import { Checkbox, FormControl, FormControlLabel, FormGroup } from '@material-ui/core';
import { UiNodeInputAttributes } from '@ory/kratos-client';
import React, { FC, useState } from 'react';
import { getNodeName, getNodeTitle, getNodeValue, isInvalidNode } from './helpers';
import KratosFeedback from './KratosFeedback';
import { KratosProps } from './KratosProps';
import KratosTermsLabel from './KratosTermsLabel';

interface KratosCheckboxProps extends KratosProps {}

const KratosCheckbox: FC<KratosCheckboxProps> = ({ node }) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  const [state, setState] = useState(Boolean(getNodeValue(node)));

  const invalid = isInvalidNode(node);
  const updatedTitle = attributes.name === 'traits.accepted_terms' ? <KratosTermsLabel /> : getNodeTitle(node);

  const checkbox = (
    <Checkbox
      name={getNodeName(node)}
      checked={state}
      onChange={() => setState(oldState => !oldState)}
      color={'primary'}
    />
  );

  return (
    <FormControl required={attributes.required} error={invalid}>
      <FormGroup row>
        <FormControlLabel control={checkbox} label={updatedTitle} />
      </FormGroup>
      <KratosFeedback node={node} />
    </FormControl>
  );
};
export default KratosCheckbox;
