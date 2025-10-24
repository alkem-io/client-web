import { useFormikContext } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { Box, Accordion, AccordionSummary, AccordionDetails, Tooltip } from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Lock from '@mui/icons-material/Lock';
import { sortBy, isEqual, startCase } from 'lodash';
import { BlockTitle } from '@/core/ui/typography';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { DataPoint, FormValueType } from './types';
import { prepareGraph, extractVariablesFromText } from './utils';
import { PropertyTable } from './PropertyTable';
import { NodeVariables } from './NodeVariables';
import StateProps from './StateProps';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { Actions } from '@/core/ui/actions/Actions';
import Button from '@mui/material/Button';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import { useTranslation } from 'react-i18next';

const FormikEffect = FormikEffectFactory<FormValueType>();

export const PromptGraphConfigForm = ({ promptGraph, setIsValid, isValid, handleSubmit }) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<FormValueType>();
  const [editingProperty, setEditingProperty] = useState<{ nodeName: string; index: number; data: DataPoint } | null>(
    null
  );
  const availableInputVariables = useRef<Record<string, string[]>>({
    START: ['conversation', 'display_name', 'description'],
  });

  const handleEditProperty = (nodeName: string, index: number, property) => {
    setEditingProperty({ nodeName, index, data: { ...property } });
  };

  const handleSaveProperty = (nodeName: string, index: number) => {
    if (!editingProperty) return;
    const currentProperties = values.nodes[nodeName]?.output?.properties || [];
    const updatedProperties = [...currentProperties];
    updatedProperties[index] = editingProperty.data;
    setFieldValue(`nodes.${nodeName}.output.properties`, updatedProperties);

    const currentSateProperties = values.state?.properties || [];
    const propIndex = currentSateProperties.findIndex(prop => prop.name === editingProperty.data.name);
    if (propIndex === -1) {
      const updatedStateProperties = [...currentSateProperties];
      updatedStateProperties.push(editingProperty.data);
      setFieldValue('state.properties', updatedStateProperties);

      setEditingProperty(null);
    }
  };

  const handleCancelEdit = () => {
    if (!editingProperty) return;
    const { nodeName, index } = editingProperty;
    const currentProperties = values.nodes[nodeName]?.output?.properties || [];
    const existingProp = currentProperties[index];

    if (
      existingProp &&
      !(existingProp.name || '').toString().trim() &&
      !(existingProp.type || '').toString().trim() &&
      !(existingProp.description || '').toString().trim()
    ) {
      const updated = currentProperties.filter((_, i) => i !== index);
      setFieldValue(`nodes.${nodeName}.output.properties`, updated);
    }

    setEditingProperty(null);
  };

  const handleDeleteProperty = (nodeName: string, index: number) => {
    const currentProperties = values.nodes[nodeName]?.output?.properties || [];
    const updatedProperties = currentProperties.filter((_, i) => i !== index);
    setFieldValue(`nodes.${nodeName}.output.properties`, updatedProperties);

    if (editingProperty?.nodeName === nodeName && editingProperty?.index === index) {
      setEditingProperty(null);
    } else if (editingProperty?.nodeName === nodeName && editingProperty.index > index) {
      setEditingProperty({ ...editingProperty, index: editingProperty.index - 1 });
    }
  };

  const handleAddProperty = (nodeName: string) => {
    const currentProperties = values.nodes[nodeName]?.output?.properties || [];
    const newProperty = {
      name: '',
      type: '',
      optional: false,
      description: '',
    };
    const updatedProperties = [...currentProperties, newProperty];
    setFieldValue(`nodes.${nodeName}.output.properties`, updatedProperties);
    const newIndex = updatedProperties.length - 1;
    setEditingProperty({ nodeName, index: newIndex, data: { ...newProperty } });
  };

  const handleFieldChange = (field: string, value) => {
    if (editingProperty) {
      setEditingProperty({
        ...editingProperty,
        data: {
          ...editingProperty.data,
          [field]: value,
        },
      });
    }
  };

  const isPropertyEditing = (nodeName: string, index: number) => {
    return editingProperty?.nodeName === nodeName && editingProperty?.index === index;
  };

  // useEffect(() => {
  //   setFieldValue('prompt', values.prompt);
  // }, [values.prompt, setFieldValue]);
  useEffect(() => {
    if (!values || !values.nodes) return;
    const nodeNames = Object.keys(values.nodes);
    nodeNames.forEach(nodeName => {
      const promptText = values.nodes?.[nodeName]?.prompt || '';
      const extracted = extractVariablesFromText(promptText);
      const existing = values.nodes?.[nodeName]?.input_variables || [];
      if (!isEqual(sortBy(existing), sortBy(extracted))) {
        setFieldValue(`nodes.${nodeName}.input_variables`, extracted);
      }
    });
  }, [values.nodes, setFieldValue]);

  const graphPath = prepareGraph(promptGraph);

  useEffect(() => {
    graphPath.forEach((node, index: number) => {
      const nodeName = node.name || node;
      if (!nodeName || typeof nodeName !== 'string') return;

      if (index === 0) {
        availableInputVariables.current[nodeName] = ['conversation', 'display_name', 'description'];
      } else {
        const prevNode = graphPath[index - 1];
        const prevNodeName = prevNode.name || prevNode;
        if (!prevNodeName || typeof prevNodeName !== 'string') return;

        const prevOutputProps = values.nodes?.[prevNodeName]?.output?.properties?.map(prop => prop.name) || [];
        availableInputVariables.current[nodeName] = (availableInputVariables.current[prevNodeName] || []).concat(
          prevOutputProps
        );
      }
    });
  }, [graphPath]);

  return (
    <>
      <FormikEffect onStatusChange={(isValid: boolean) => setIsValid(isValid)} />
      <Box>
        <Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box>
              <BlockTitle variant="h5" sx={{ marginBottom: 0 }}>
                {t('pages.virtualContributorProfile.settings.promptGraph.stepsTitle')}
              </BlockTitle>

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left', marginY: 2 }}>
                {graphPath.map((node, index) => {
                  const hasNextNode = index < graphPath.length - 1;
                  return (
                    <Box key={`${typeof node === 'string' ? node : node.name}-${index}`} sx={{ width: '100%' }}>
                      <>
                        {node && typeof node === 'object' ? (
                          <Accordion sx={{ marginBottom: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>{startCase(node.name)}</span>
                                {node.system ? (
                                  <Tooltip
                                    title={t('pages.virtualContributorProfile.settings.promptGraph.systemNodeTooltip')}
                                  >
                                    <Lock fontSize="small" sx={{ color: 'text.secondary' }} />
                                  </Tooltip>
                                ) : null}
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              {(() => {
                                // For system nodes, only render a read-only output properties table
                                const propertiesArray =
                                  values.nodes[node.name]?.output?.properties || node.output?.properties || [];

                                if (node.system) {
                                  return propertiesArray && propertiesArray.length > 0 ? (
                                    <PropertyTable nodeName={node.name} properties={propertiesArray} readOnly />
                                  ) : null;
                                }

                                // Non-system nodes: render variables, prompt input and editable properties
                                return (
                                  <>
                                    <NodeVariables
                                      variables={values.nodes?.[node.name]?.input_variables || node.input_variables}
                                      available={availableInputVariables.current[node.name]}
                                    />
                                    <FormikMarkdownField
                                      name={`nodes.${node.name}.prompt`}
                                      title={t('pages.virtualContributorProfile.settings.promptGraph.promptFieldTitle')}
                                      maxLength={MARKDOWN_TEXT_LENGTH}
                                      onChange={value => {
                                        setFieldValue(`nodes.${node.name}.prompt`, value);
                                      }}
                                    />
                                    {(() => {
                                      const propertiesArray =
                                        values.nodes[node.name]?.output?.properties || node.output?.properties || [];
                                      return propertiesArray.length > 0 ? (
                                        <PropertyTable
                                          nodeName={node.name}
                                          properties={propertiesArray}
                                          editingProperty={editingProperty}
                                          isPropertyEditing={isPropertyEditing}
                                          onEdit={handleEditProperty}
                                          onSave={handleSaveProperty}
                                          onDelete={handleDeleteProperty}
                                          onAdd={handleAddProperty}
                                          onCancel={handleCancelEdit}
                                          onFieldChange={handleFieldChange}
                                        />
                                      ) : null;
                                    })()}
                                  </>
                                );
                              })()}
                            </AccordionDetails>
                          </Accordion>
                        ) : (
                          <Box
                            sx={{
                              padding: 2,
                              marginBottom: 1,
                              backgroundColor: 'background.default',
                              border: '1px solid #ccc',
                              borderRadius: 1,
                            }}
                          >
                            {node}
                          </Box>
                        )}
                      </>
                      {hasNextNode && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 1, paddingLeft: 0 }}>
                          <Box sx={{ fontSize: 28, lineHeight: 1 }}>↓</Box>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
            {/* disabled for now - state should be handled by the form */}
            {false && <StateProps promptGraph={promptGraph} />}
          </Box>
          {/* add node functionality to be implemented */}
          {/* <Button variant="outlined" sx={{ marginTop: 1 }}> */}
          {/*   {`+ ${t('pages.virtualContributorProfile.settings.promptGraph.addButton')}`} */}
          {/* </Button> */}
        </Box>
        <Actions>
          <Button variant="contained" disabled={!isValid} onClick={() => handleSubmit(values)}>
            {t('pages.virtualContributorProfile.settings.promptGraph.saveBtn')}
          </Button>
        </Actions>
      </Box>
    </>
  );
};

export default PromptGraphConfigForm;
