import { Checkbox, FormControl, FormControlLabel, FormGroup, Grid } from '@mui/material';
import { UiNodeInputAttributes } from '@ory/kratos-client';
import React, { FC, useContext, useState } from 'react';
import { KratosUIContext } from '../KratosUI';
import { getNodeName, getNodeTitle, getNodeValue, isInvalidNode } from './helpers';
import KratosFeedback from './KratosFeedback';
import { KratosProps } from './KratosProps';
import KratosTermsLabel from './KratosTermsLabel';

interface KratosCheckboxProps extends KratosProps {}

const KratosCheckbox: FC<KratosCheckboxProps> = ({ node }) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  const { isHidden } = useContext(KratosUIContext);
  const [state, setState] = useState(Boolean(getNodeValue(node)));

  const invalid = isInvalidNode(node);
  const updatedTitle = attributes.name === 'traits.accepted_terms' ? <KratosTermsLabel /> : getNodeTitle(node);

  const checkbox = (
    <Checkbox
      name={getNodeName(node)}
      checked={state}
      onChange={() => setState(oldState => !oldState)}
      color={'primary'}
      value={String(state)}
    />
  );

  return (
    <Grid item xs={12}>
      {!isHidden(node) && (
        <FormControl required={attributes.required} error={invalid}>
          <FormGroup row>
            <FormControlLabel control={checkbox} label={updatedTitle} />
          </FormGroup>
          <KratosFeedback node={node} />
        </FormControl>
      )}
    </Grid>
  );
};
export default KratosCheckbox;
