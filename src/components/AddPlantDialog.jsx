import React, { useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField
} from '@mui/material';

function AddPlantDialog({ open, onClose, onSave }) {
  const [plantName, setPlantName] = useState('');

  const handleSave = () => {
    if (plantName.trim()) {
      onSave(plantName.trim());
      setPlantName(''); // Reset for next time
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add a New Plant</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Plant Name (e.g., Basil)"
          type="text"
          fullWidth
          variant="outlined"
          value={plantName}
          onChange={(e) => setPlantName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSave()}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save Plant</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddPlantDialog;