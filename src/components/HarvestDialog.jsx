import React, { useState, useEffect } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  RadioGroup, FormControlLabel, Radio, FormControl, FormLabel
} from '@mui/material';

function HarvestDialog({ open, onClose, onSave, plantName }) {
  const [quantity, setQuantity] = useState('');
  const [action, setAction] = useState('keep'); // 'keep' or 'remove'

  // Reset form when the dialog opens for a new harvest
  useEffect(() => {
    if (open) {
      setQuantity('');
      setAction('keep');
    }
  }, [open]);

  const handleSave = () => {
    onSave({
      quantity,
      action,
    });
    onClose(); // Close the dialog after saving
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Log Harvest: {plantName}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Quantity Harvested (e.g., 5 tomatoes, 2 lbs)"
          type="text"
          fullWidth
          variant="outlined"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          sx={{ mt: 1 }}
        />
        <FormControl sx={{ mt: 3 }}>
          <FormLabel>After harvesting, is this plant:</FormLabel>
          <RadioGroup
            row
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            <FormControlLabel value="keep" control={<Radio />} label="Still growing (Fruiting)" />
            <FormControlLabel value="remove" control={<Radio />} label="Finished (Remove from plot)" />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save Harvest</Button>
      </DialogActions>
    </Dialog>
  );
}

export default HarvestDialog;