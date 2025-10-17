import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Checkbox, Button, IconButton } from '@mui/material';
import { BlockTitle } from '@/core/ui/typography';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

export const PropertyTable = ({
  nodeName,
  properties,
  editingProperty,
  isPropertyEditing,
  onEdit,
  onSave,
  onDelete,
  onAdd,
  onCancel,
  onFieldChange,
  readOnly = false,
}: {
  nodeName: string;
  properties: any[];
  editingProperty: { nodeName: string; index: number; data: any } | null;
  isPropertyEditing: (nodeName: string, index: number) => boolean;
  onEdit: (nodeName: string, index: number, prop: any) => void;
  onSave: (nodeName: string, index: number) => void;
  onDelete: (nodeName: string, index: number) => void;
  onAdd: (nodeName: string) => void;
  onCancel: () => void;
  onFieldChange: (field: string, value: any) => void;
  readOnly?: boolean;
}) => {
  return (
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
            {properties.map((prop, idx) => {
              const isEditing = !readOnly && isPropertyEditing(nodeName, idx);
              const displayData = isEditing ? editingProperty!.data : prop;

              return (
                <TableRow key={idx}>
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        size="small"
                        value={displayData.name || ''}
                        onChange={e => onFieldChange('name', e.target.value)}
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
                        onChange={e => onFieldChange('type', e.target.value)}
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
                        onChange={e => onFieldChange('optional', e.target.checked)}
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
                        onChange={e => onFieldChange('description', e.target.value)}
                        fullWidth
                        multiline
                      />
                    ) : (
                      prop.description || 'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {!readOnly ? (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {isEditing ? (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => onSave(nodeName, idx)}
                              color="primary"
                              disabled={
                                !(
                                  editingProperty &&
                                  editingProperty.data &&
                                  (editingProperty.data.name || '').trim() &&
                                  (editingProperty.data.type || '').trim() &&
                                  (editingProperty.data.description || '').trim()
                                )
                              }
                            >
                              <SaveIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={onCancel} color="inherit">
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </>
                        ) : (
                          <IconButton size="small" onClick={() => onEdit(nodeName, idx, prop)} color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton size="small" onClick={() => onDelete(nodeName, idx)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {!readOnly && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginTop: 1 }}>
          <Button variant="outlined" size="small" onClick={() => onAdd(nodeName)}>
            + Add Property
          </Button>
        </Box>
      )}
    </Box>
  );
};
