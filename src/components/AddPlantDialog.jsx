import React, { useState, useEffect } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio
} from '@mui/material';

function AddPlantDialog({ open, onClose, onSave }) {
  const [plantName, setPlantName] = useState('');
  const [status, setStatus] = useState('Seed'); // Default status

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setPlantName('');
      setStatus('Seed');
    }
  }, [open]);

  const handleSave = () => {
    if (plantName.trim()) {
      // Pass an object with both name and status
      onSave({ name: plantName.trim(), status });
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
          sx={{ mt: 1 }}
        />
        
        {/* --- NEW STATUS INPUT --- */}
        <FormControl sx={{ mt: 3 }}>
          <FormLabel>Initial Status</FormLabel>
          <RadioGroup
            row
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <FormControlLabel value="Seed" control={<Radio />} label="Seed" />
            <FormControlLabel value="Sapling" control={<Radio />} label="Sapling" />
            <FormControlLabel value="Fruiting" control={<Radio />} label="Fruiting" />
          </RadioGroup>
        </FormControl>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={!plantName.trim()}>Save Plant</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddPlantDialog;