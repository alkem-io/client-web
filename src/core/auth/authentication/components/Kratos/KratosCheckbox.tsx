import { Checkbox, FormControl, FormControlLabel, FormGroup, GridLegacy } from '@mui/material';
import type { UiNodeInputAttributes } from '@ory/kratos-client';
import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getNodeName, getNodeTitle, getNodeValue, isInvalidNode } from './helpers';
import KratosFeedback from './KratosFeedback';
import type { KratosProps } from './KratosProps';

interface KratosCheckboxProps extends KratosProps {}

const KratosCheckbox: FC<KratosCheckboxProps> = ({ node }) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  const [state, setState] = useState(Boolean(getNodeValue(node)));

  const { t } = useTranslation();

  const invalid = isInvalidNode(node);

  const checkbox = (
    <Checkbox
      name={getNodeName(node)}
      checked={state}
      onChange={() => setState(oldState => !oldState)}
      color="primary"
    />
  );

  return (
    <GridLegacy item={true} xs={12}>
      <FormControl required={attributes.required} error={invalid}>
        <FormGroup row={true}>
          <FormControlLabel control={checkbox} label={getNodeTitle(node, t)} />
        </FormGroup>
        <KratosFeedback node={node} />
      </FormControl>
    </GridLegacy>
  );
};

export default KratosCheckbox;
