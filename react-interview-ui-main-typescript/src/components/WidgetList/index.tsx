import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';

import { fetchAllWidgets, Widget, createWidget, deleteWidget, updateWidget, searchWidgetByName } from '../../lib/apiConnect';
import DisplayWidget from '../WidgetDisplay';

const WidgetList = (): JSX.Element => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newWidget, setNewWidget] = useState({ name: '', description: '', price: '' });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name: string; description: string; price: string }>({
    name: '',
    description: '',
    price: '',
  });
  
  
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);

  // Added state for updating widget
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [updatedWidget, setUpdatedWidget] = useState<Widget | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWidgets, setFilteredWidgets] = useState<Widget[]>([]);

 useEffect(() => {
  fetchAllWidgets()
    .then((data) => {
      setWidgets(data);
      setFilteredWidgets(data); // ✅ Initialize filteredWidgets with full data
    })
    .catch((error) => console.error('Error fetching widgets', error));
}, []);

useEffect(() => {
  const delaySearch = setTimeout(() => {
    handleSearch();
    // Adds a delay of 300ms before making the API call
  }, 300); 
  return () => clearTimeout(delaySearch);
}, [searchQuery]);

useEffect(() => {
  handleSearch();
}, [searchQuery, widgets]); 

 // Handle Search
 const handleSearch = async () => {
  if (!searchQuery.trim()) {
    setFilteredWidgets(widgets);
    return;
  }
  try {
    const searchResults = await searchWidgetByName(searchQuery);
    console.log('Search Results:', searchResults);

    // Ensure searchResults is an array
    setFilteredWidgets(Array.isArray(searchResults) ? searchResults : [searchResults]);
  } catch (error) {
    console.error('Error searching widgets:', error);
    setFilteredWidgets([]); 
  }
};

//validationg user inputs
const validateInput = (name: string, value: string): string => {
  if (name === 'name') {
    if (!/^[A-Za-z\s]+$/.test(value)) {
      return 'Only letters and spaces are allowed';
    }
    if (value.length < 3 || value.length > 100) {
      return 'Name must be between 3 and 100 characters';
    }
  }
  if (name === 'description') {
    if (!/^[A-Za-z\s]+$/.test(value)) {
      return 'Only letters and spaces are allowed';
    }
    if (value.length < 5 || value.length > 1000) {
      return 'Description must be between 5 and 1000 characters';
    }
  }
  if (name === 'price') {
    const price = parseFloat(value);
    if (isNaN(price) || price < 1 || price > 20000) {
      return 'Price must be between 1 and 20,000';
    }
    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
      return 'Price must have up to 2 decimal places';
    }
  }
  return '';
};

  // Open delete confirmation dialog
  const confirmDeleteWidget = (widget: Widget) => {
    setSelectedWidget(widget);
    setOpenDeleteDialog(true);
  };

  // Handle delete action
  const handleDeleteWidget = async () => {
    if (!selectedWidget) return;

    try {
      console.log(`Deleting: ${selectedWidget.name}`);
      // Close dialog before making API call
      setOpenDeleteDialog(false);
      await deleteWidget(selectedWidget.name);
      // Update state correctly
      setWidgets((prevWidgets) => prevWidgets.filter((w) => w.name !== selectedWidget.name));
      // Reset selectedWidget after deletion
      setSelectedWidget(null);
      // Show success message
      setSuccessMessage(`Widget '${selectedWidget.name}' deleted successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error deleting widget:', error);
      alert(`Failed to delete widget: ${error.message}`);
    }
  };

  // Handle create widget
  const [errorDialog, setErrorDialog] = useState({ open: false, message: '' });
  const handleCreateWidget = async () => {
    const widgetPrice = parseFloat(newWidget.price); // Ensure price is a number
    // Validate inputs
    const nameError = validateInput('name', newWidget.name);
    const descriptionError = validateInput('description', newWidget.description);
    const priceError = validateInput('price', newWidget.price);
  
    if (
      nameError ||
      descriptionError ||
      !newWidget.name.trim() ||
      !newWidget.description.trim() ||
      isNaN(widgetPrice) ||
      widgetPrice <= 0
    ) {
      setErrors({ name: nameError, description: descriptionError, price: priceError });
      alert('Please enter valid widget details.');
      return;
    }
  
    // Check if widget with the same name already exists
    const widgetExists = widgets.some((widget) => widget.name.toLowerCase() === newWidget.name.toLowerCase());
    if (widgetExists) {
      setErrorDialog({ open: true, message: `Widget with name "${newWidget.name}" already exists. Please choose another name.` });
      return;
    }
  
    // Proceed with creating the widget
    const newWidgetData: Widget = {
      name: newWidget.name.trim(),
      description: newWidget.description.trim(),
      price: widgetPrice,
    };
    try {
      console.log('Sending data:', JSON.stringify(newWidgetData));
      const createdWidget = await createWidget(newWidgetData);
  
      setWidgets([...widgets, createdWidget]);
      setSuccessMessage('Widget created successfully!');
      setNewWidget({ name: '', description: '', price: '' });
      setErrors({ name: '', description: '', price: '' });
      setOpenCreateDialog(false);
  
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to create widget:', error.response?.data);
      alert(`Failed to create widget: ${error.response?.data?.message || error.message}`);
    }
  };
  
  // Open update dialog and set the widget to update
  const handleOpenUpdateDialog = (widget: Widget) => {
    setUpdatedWidget({ ...widget });
    setOpenUpdateDialog(true);
  };

  // Handle widget update
  const handleUpdateWidget = async () => {
    if (!updatedWidget) return;
  
    const nameError = validateInput('name', updatedWidget.name);
    const descriptionError = validateInput('description', updatedWidget.description);
    const priceError = validateInput('price', updatedWidget.price.toString());
  
    const widgetPrice = parseFloat(updatedWidget.price.toString());
  
    if (nameError || descriptionError || priceError || !updatedWidget.name.trim() || !updatedWidget.description.trim() || isNaN(widgetPrice) || widgetPrice <= 0) {
      setErrors({ name: nameError, description: descriptionError, price: priceError });
      alert('Please enter valid widget details.');
      return;
    }
  
    try {
      await updateWidget(updatedWidget.name, updatedWidget);
  
      // Update the widget in the state
      setWidgets((prevWidgets) =>
        prevWidgets.map((w) => (w.name === updatedWidget.name ? updatedWidget : w))
      );
  
      setOpenUpdateDialog(false);
      setSuccessMessage(`Widget '${updatedWidget.name}' updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      alert(`Failed to update widget: ${error.response?.data?.message || error.message}`);
    }
  };
  
  return (
    <Stack spacing={4} sx={{ margin: 'auto', maxWidth: 900, paddingTop: '4em', width: '100%' }}>
      <Typography sx={{ textAlign: 'center' }} variant="h3">
        List of Widgets
      </Typography>

      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      <Button variant="contained" color="secondary" onClick={() => setOpenCreateDialog(true)}>
        Create Widget
      </Button>
 {/* Search Bar */}
 <Stack direction="row" spacing={2} alignItems="center">
 <TextField
  label="Search Widget"
  variant="outlined"
  fullWidth
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
      </Stack>
      {filteredWidgets.length === 0 ? (
  <Typography color="error" sx={{ textAlign: 'center' }} variant="h5">
    No widgets found.
  </Typography>
) : (
  <Grid container spacing={4}>
    {filteredWidgets.map((widget) => (
      <DisplayWidget 
        key={widget.name} 
        widget={widget} 
        onDelete={confirmDeleteWidget} 
        onEdit={handleOpenUpdateDialog}
      />
    ))}
  </Grid>
      )}

    {/* Create Widget Dialog */}
<Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} fullWidth maxWidth="sm">
  <DialogTitle>Create a New Widget</DialogTitle>
  <DialogContent>
    <Stack spacing={2} sx={{ mt: 1 }}>
      {/* Name Field with Validation */}
      <TextField
  label="Name"
  fullWidth
  value={newWidget.name}
  onChange={(e) => {
    const value = e.target.value;
    const errorMsg = validateInput('name', value);
    setNewWidget({ ...newWidget, name: value });
    setErrors((prevErrors) => ({ ...prevErrors, name: errorMsg }));
  }}
  error={!!errors.name}
  helperText={errors.name}
/>
<TextField
  label="Description"
  fullWidth
  value={newWidget.description}
  onChange={(e) => {
    const value = e.target.value;
    const errorMsg = validateInput('description', value);
    setNewWidget({ ...newWidget, description: value });
    setErrors((prevErrors) => ({ ...prevErrors, description: errorMsg }));
  }}
  error={!!errors.description}
  helperText={errors.description}
/>
  {/* Price Field (No Validation Needed) */}
      <TextField
  label="Price"
  type="number"
  fullWidth
  value={newWidget.price}
  onChange={(e) => {
    const value = e.target.value;
    const errorMsg = validateInput('price', value);
    setNewWidget({ ...newWidget, price: value });
    setErrors((prevErrors) => ({ ...prevErrors, price: errorMsg }));
  }}
  error={!!errors.price}
  helperText={errors.price}
/>
    </Stack>
  </DialogContent>
  <DialogActions sx={{ pb: 2, px: 3 }}>
    <Button onClick={() => setOpenCreateDialog(false)} color="secondary">Cancel</Button>
    <Button 
  onClick={handleCreateWidget} 
  variant="contained" 
  color="primary" 
  disabled={!!errors.name || !!errors.description || !!errors.price}
>
  Create
</Button>
  </DialogActions>
</Dialog>
{/* Update Widget Dialog */}
<Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} fullWidth maxWidth="sm">
  <DialogTitle>Update Widget</DialogTitle>
  <DialogContent>
    <Stack spacing={2} sx={{ mt: 1 }}>
      {/* Name Field (Read-Only) */}
      <TextField
        label="Name"
        fullWidth
        value={updatedWidget?.name || ''}
        disabled
        sx={{ backgroundColor: '#f5f5f5', borderRadius: 1 }}
      />

      {/* Description Field */}
      <TextField
  label="Description"
  fullWidth
  value={updatedWidget?.description || ''}
  onChange={(e) => {
    const value = e.target.value;
    const errorMsg = validateInput('description', value);
    setUpdatedWidget((prev) =>
      prev ? { ...prev, description: value } : null
    );
    setErrors((prevErrors) => ({ ...prevErrors, description: errorMsg }));
  }}
  error={!!errors.description}
  helperText={errors.description}
/>

      {/* Price Field */}
      <TextField
  label="Price"
  type="number"
  fullWidth
  value={updatedWidget?.price || ''}
  onChange={(e) => {
    const value = e.target.value;
    const priceNumber = value === '' ? '' : parseFloat(value);
    const errorMsg = validateInput('price', value);
    setUpdatedWidget((prev) =>
      prev ? { ...prev, price: priceNumber as number } : null
    );

    setErrors((prevErrors) => ({ ...prevErrors, price: errorMsg }));
  }}
  error={!!errors.price}
  helperText={errors.price}
/>
    </Stack>
  </DialogContent>
  <DialogActions sx={{ pb: 2, px: 3 }}>
    <Button onClick={() => setOpenUpdateDialog(false)} color="secondary">Cancel</Button>
    <Button onClick={handleUpdateWidget} variant="contained" color="primary">Update</Button>
  </DialogActions>
</Dialog>

  {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{selectedWidget?.name}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteWidget} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

  {/* Error Dialog */}
<Dialog open={errorDialog.open} onClose={() => setErrorDialog({ open: false, message: '' })}>
  <DialogTitle>Error</DialogTitle>
  <DialogContent>
    <Typography color="error">{errorDialog.message}</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setErrorDialog({ open: false, message: '' })} color="primary">
      OK
    </Button>
  </DialogActions>
</Dialog>
    </Stack>
  );
};

export default WidgetList;
