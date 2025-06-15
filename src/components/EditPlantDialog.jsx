import React, { useState, useEffect } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio
} from '@mui/material';

function EditPlantDialog({ open, onClose, onSave, plant }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Seed');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (plant) {
      setName(plant.name || '');
      setStatus(plant.status || 'Seed');
      // Join notes into a string for editing in a textarea
      setNotes((plant.notes || []).join('\n'));
    }
  }, [plant, open]);

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        ...plant,
        name: name.trim(),
        status,
        // Split notes from textarea back into an array of non-empty lines
        notes: notes.split('\n').filter(note => note.trim() !== '')
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit {plant?.name}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Plant Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mt: 1 }}
        />

        <FormControl sx={{ mt: 3 }}>
          <FormLabel>Status</FormLabel>
          <RadioGroup
            row
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <FormControlLabel value="Seedling" control={<Radio />} label="Seedling" />
            <FormControlLabel value="Sprout" control={<Radio />} label="Sprout" />
            <FormControlLabel value="Growing" control={<Radio />} label="Growing" />
            <FormControlLabel value="Blooming" control={<Radio />} label="Blooming" />
            <FormControlLabel value="Fruiting" control={<Radio />} label="Fruiting" />
            <FormControlLabel value="Ripening" control={<Radio />} label="Ripening" />
            <FormControlLabel value="Withering" control={<Radio />} label="Withering" />
            
          </RadioGroup>
        </FormControl>

        <TextField
          margin="dense"
          label="Notes (one per line)"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mt: 2 }}
        />

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={!name.trim()}>Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditPlantDialog;
