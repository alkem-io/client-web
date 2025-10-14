import { useAiPersonaQuery, useUpdateAiPersonaMutation } from '@/core/apollo/generated/apollo-hooks';
import * as yup from 'yup';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContent from '@/core/ui/content/PageContent';
import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography';
import { Actions } from '@/core/ui/actions/Actions';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { Formik, useFormikContext } from 'formik';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { useMemo, useState } from 'react';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  Button,
  OutlinedInput,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Gutters from '@/core/ui/grid/Gutters';

type FormValueType = {
  prompt: string;
  nodes: Record<string, { prompt: string; output?: { properties: any[] } }>;
};
const FormikEffect = FormikEffectFactory<FormValueType>();

const PromptConfig = ({ vc }) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [prompt, setPrompt] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [editingProperty, setEditingProperty] = useState<{ nodeName: string; index: number; data: any } | null>(null);
  const vcId = vc?.id;

  const { data, loading } = useAiPersonaQuery({
    variables: { id: vcId },
    skip: !vcId,
  });
  const aiPersona = data?.virtualContributor?.aiPersona;

  const [updateAiPersona, { loading: updateLoading }] = useUpdateAiPersonaMutation();

  const initialValues: FormValueType = useMemo(() => {
    setPrompt(aiPersona?.prompt[0] || '');

    // Build nodes object from promptGraph
    const nodesData: Record<string, { prompt: string; output?: { properties: any[] } }> = {};
    const promptGraph = aiPersona?.promptGraph || { nodes: [], edges: [] };
    promptGraph.nodes?.forEach(node => {
      if (node.name) {
        nodesData[node.name] = {
          prompt: node.prompt || '',
          output: node.output?.properties ? { properties: node.output.properties } : undefined
        };
      }
    });

    console.log({ nodesData });

    return {
      prompt: aiPersona?.prompt[0] || '',
      nodes: nodesData,
    };
  }, [aiPersona?.id]);

  const validationSchema = yup.object().shape({
    prompt: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  });

  const handleSubmit = () => {
    updateAiPersona({
      variables: {
        aiPersonaData: {
          ID: aiPersona?.id!,
          prompt: [prompt],
        },
      },
      onCompleted: () => {
        notify(t('pages.virtualContributorProfile.success', { entity: t('common.settings') }), 'success');
      },
    });
  };
  if (!vc) {
    return null;
  }
  const availableVariables = 'duration, audience, workshop_type, role, purpose';
  const promptGraph = aiPersona?.promptGraph || { nodes: [], edges: [] };

  return (
    <PageContent background="background.paper">
      <PageContentColumn columns={12}>
        <PageContentBlock>
          <BlockTitle>{t('pages.virtualContributorProfile.settings.prompt.title')}</BlockTitle>
          <Caption>{t('pages.virtualContributorProfile.settings.prompt.infoText', { availableVariables })}</Caption>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize
            validateOnMount
            onSubmit={() => {}}
          >
            <PromptConfigForm
              promptGraph={promptGraph}
              setPrompt={setPrompt}
              setIsValid={setIsValid}
              isValid={isValid}
              loading={loading}
              updateLoading={updateLoading}
              handleSubmit={handleSubmit}
              t={t}
            />
          </Formik>
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};

const PromptConfigForm = ({ promptGraph, setPrompt, setIsValid, isValid, loading, updateLoading, handleSubmit, t }) => {
  const { values, setFieldValue } = useFormikContext<FormValueType>();
  const [editingProperty, setEditingProperty] = useState<{ nodeName: string; index: number; data: any } | null>(null);

  const handleEditProperty = (nodeName: string, index: number, property: any) => {
    // Set the editing property (this automatically cancels any other editing)
    setEditingProperty({ nodeName, index, data: { ...property } });
  };

  const handleSaveProperty = (nodeName: string, index: number) => {
    if (!editingProperty) return;

    // Update the output properties in Formik values
    const currentProperties = values.nodes[nodeName]?.output?.properties || [];
    const updatedProperties = [...currentProperties];
    updatedProperties[index] = editingProperty.data;

    setFieldValue(`nodes.${nodeName}.output.properties`, updatedProperties);

    // Clear editing state
    setEditingProperty(null);
  };

  const handleCancelEdit = () => {
    setEditingProperty(null);
  };

  const handleDeleteProperty = (nodeName: string, index: number) => {
    // TODO: Implement delete logic to remove the property
    console.log('Delete property:', nodeName, index);
  };

  const handleAddProperty = (nodeName: string) => {
    // Get current properties
    const currentProperties = values.nodes[nodeName]?.output?.properties || [];
    
    // Create new empty property
    const newProperty = {
      name: '',
      type: '',
      optional: false,
      description: ''
    };
    
    // Add to the list
    const updatedProperties = [...currentProperties, newProperty];
    setFieldValue(`nodes.${nodeName}.output.properties`, updatedProperties);
    
    // Put the new property in edit mode
    const newIndex = updatedProperties.length - 1;
    setEditingProperty({ nodeName, index: newIndex, data: { ...newProperty } });
  };

  const handleFieldChange = (field: string, value: any) => {
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

  return (
    <>
      <FormikEffect onStatusChange={(isValid: boolean) => setIsValid(isValid)} />
      <Box>
        <Box>
          <BlockTitle variant="h5" sx={{ marginBottom: 0 }}>
            Steps
          </BlockTitle>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left', marginY: 2 }}>
            {promptGraph.edges?.map((edge, index) => {
              const sourceNode = promptGraph.nodes?.find(node => node.name === edge.from);
              const targetNode = promptGraph.nodes?.find(node => node.name === edge.to);

              return (
                <Box key={`${edge.from}-${edge.to}-${index}`} sx={{ width: '100%' }}>
                  {index === 0 && (
                    <>
                      {sourceNode ? (
                        <Accordion
                          sx={{
                            marginBottom: 1,
                          }}
                        >
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>{sourceNode.name}</AccordionSummary>
                          <AccordionDetails>
                            <FormikMarkdownField
                              name={`nodes.${edge.from}.prompt`}
                              title="Prompt"
                              maxLength={MARKDOWN_TEXT_LENGTH}
                            />
                            {sourceNode.output?.properties?.length && sourceNode.output.properties.length > 0 && (
                              <Box sx={{ marginTop: 2 }}>
                                <BlockTitle variant="h6">Output Properties</BlockTitle>
                                <TableContainer component={Paper} sx={{ marginTop: 1 }}>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Optional</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Actions</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {(values.nodes[edge.from!]?.output?.properties || sourceNode.output?.properties || []).map(
                                        (prop, idx) => {
                                          const isEditing = isPropertyEditing(edge.from!, idx);
                                          const displayData = isEditing ? editingProperty!.data : prop;

                                          return (
                                            <TableRow key={idx}>
                                              <TableCell>
                                                {isEditing ? (
                                                  <TextField
                                                    size="small"
                                                    value={displayData.name || ''}
                                                    onChange={e => handleFieldChange('name', e.target.value)}
                                                    fullWidth
                                                  />
                                                ) : (
                                                  prop.name || 'N/A'
                                                )}
                                              </TableCell>
                                              <TableCell>
                                                {isEditing ? (
                                                  <TextField
                                                    size="small"
                                                    value={displayData.type || ''}
                                                    onChange={e => handleFieldChange('type', e.target.value)}
                                                    fullWidth
                                                  />
                                                ) : (
                                                  prop.type || 'N/A'
                                                )}
                                              </TableCell>
                                              <TableCell>
                                                {isEditing ? (
                                                  <Checkbox
                                                    checked={displayData.optional || false}
                                                    onChange={e => handleFieldChange('optional', e.target.checked)}
                                                  />
                                                ) : prop.optional ? (
                                                  'Yes'
                                                ) : (
                                                  'No'
                                                )}
                                              </TableCell>
                                              <TableCell>
                                                {isEditing ? (
                                                  <TextField
                                                    size="small"
                                                    value={displayData.description || ''}
                                                    onChange={e => handleFieldChange('description', e.target.value)}
                                                    fullWidth
                                                    multiline
                                                  />
                                                ) : (
                                                  prop.description || 'N/A'
                                                )}
                                              </TableCell>
                                              <TableCell>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                  {isEditing ? (
                                                    <IconButton
                                                      size="small"
                                                      onClick={() => handleSaveProperty(edge.from!, idx)}
                                                      color="primary"
                                                    >
                                                      <SaveIcon fontSize="small" />
                                                    </IconButton>
                                                  ) : (
                                                    <IconButton
                                                      size="small"
                                                      onClick={() => handleEditProperty(edge.from!, idx, prop)}
                                                      color="primary"
                                                    >
                                                      <EditIcon fontSize="small" />
                                                    </IconButton>
                                                  )}
                                                  <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteProperty(edge.from!, idx)}
                                                    color="error"
                                                  >
                                                    <DeleteIcon fontSize="small" />
                                                  </IconButton>
                                                </Box>
                                              </TableCell>
                                            </TableRow>
                                          );
                                        }
                                      )}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginTop: 1 }}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleAddProperty(edge.from!)}
                                  >
                                    + Add Property
                                  </Button>
                                </Box>
                              </Box>
                            )}
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
                          {edge.from}
                        </Box>
                      )}
                    </>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'left', marginBottom: 1, paddingLeft: 2 }}>↓</Box>
                  {targetNode ? (
                    <Accordion
                      sx={{
                        marginBottom: 1,
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>{targetNode.name}</AccordionSummary>
                      <AccordionDetails>
                        <FormikMarkdownField
                          name={`nodes.${edge.to}.prompt`}
                          title="Prompt"
                          maxLength={MARKDOWN_TEXT_LENGTH}
                        />
                        {targetNode.output?.properties?.length && targetNode.output.properties.length > 0 && (
                          <Box sx={{ marginTop: 2 }}>
                            <BlockTitle variant="h6">Output Properties</BlockTitle>
                            <TableContainer component={Paper} sx={{ marginTop: 1 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Optional</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Actions</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {(values.nodes[edge.to!]?.output?.properties || targetNode.output?.properties || []).map(
                                    (prop, idx) => {
                                      const isEditing = isPropertyEditing(edge.to!, idx);
                                      const displayData = isEditing ? editingProperty!.data : prop;

                                      return (
                                        <TableRow key={idx}>
                                          <TableCell>
                                            {isEditing ? (
                                              <TextField
                                                size="small"
                                                value={displayData.name || ''}
                                                onChange={e => handleFieldChange('name', e.target.value)}
                                                fullWidth
                                              />
                                            ) : (
                                              prop.name || 'N/A'
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            {isEditing ? (
                                              <TextField
                                                size="small"
                                                value={displayData.type || ''}
                                                onChange={e => handleFieldChange('type', e.target.value)}
                                                fullWidth
                                              />
                                            ) : (
                                              prop.type || 'N/A'
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            {isEditing ? (
                                              <Checkbox
                                                checked={displayData.optional || false}
                                                onChange={e => handleFieldChange('optional', e.target.checked)}
                                              />
                                            ) : prop.optional ? (
                                              'Yes'
                                            ) : (
                                              'No'
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            {isEditing ? (
                                              <TextField
                                                size="small"
                                                value={displayData.description || ''}
                                                onChange={e => handleFieldChange('description', e.target.value)}
                                                fullWidth
                                                multiline
                                              />
                                            ) : (
                                              prop.description || 'N/A'
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                              {isEditing ? (
                                                <IconButton
                                                  size="small"
                                                  onClick={() => handleSaveProperty(edge.to!, idx)}
                                                  color="primary"
                                                >
                                                  <SaveIcon fontSize="small" />
                                                </IconButton>
                                              ) : (
                                                <IconButton
                                                  size="small"
                                                  onClick={() => handleEditProperty(edge.to!, idx, prop)}
                                                  color="primary"
                                                >
                                                  <EditIcon fontSize="small" />
                                                </IconButton>
                                              )}
                                              <IconButton
                                                size="small"
                                                onClick={() => handleDeleteProperty(edge.to!, idx)}
                                                color="error"
                                              >
                                                <DeleteIcon fontSize="small" />
                                              </IconButton>
                                            </Box>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    }
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginTop: 1 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleAddProperty(edge.to!)}
                              >
                                + Add Property
                              </Button>
                            </Box>
                          </Box>
                        )}
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
                      {edge.to}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        <Button variant="outlined" sx={{ marginTop: 1 }}>
          + Add
        </Button>
      </Box>
      <Actions>
        <Button variant="contained" loading={loading || updateLoading} disabled={!isValid} onClick={handleSubmit}>
          {t('pages.virtualContributorProfile.settings.prompt.saveBtn')}
        </Button>
      </Actions>
    </>
  );
};

export default PromptConfig;
