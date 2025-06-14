import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box, Typography } from '@mui/material';

const msToDHMS = (ms) => {
  if (!ms) return { days: 0, hours: 0, minutes: 0 };
  let days = Math.floor(ms / 86400000);
  let hours = Math.floor((ms % 86400000) / 3600000);
  let minutes = Math.floor((ms % 3600000) / 60000);
  return { days, hours, minutes };
};

function EditPlotDialog({ open, onClose, onSave, plot }) {
  const [name, setName] = useState('');
  const [plants, setPlants] = useState(['', '', '']);
  const [interval, setInterval] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    if (plot) {
      setName(plot.name || '');
      const plotPlants = plot.plants || [];
      setPlants([ plotPlants[0] || '', plotPlants[1] || '', plotPlants[2] || '' ]);
      setInterval(msToDHMS(plot.wateringInterval));
    }
  }, [plot, open]);

  const handleSave = () => {
    const totalMs = (interval.days * 86400000) + (interval.hours * 3600000) + (interval.minutes * 60000);
    onSave({ ...plot, name, plants: plants.filter(p => p), wateringInterval: totalMs });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Plot</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label="Plot Name" type="text" fullWidth value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />
        <Typography variant="subtitle1" sx={{ mt: 2 }}>Watering Interval</Typography>
        <Box display="flex" gap={2}>
          <TextField label="Days" type="number" value={interval.days} onChange={(e) => setInterval({...interval, days: Number(e.target.value)})} />
          <TextField label="Hours" type="number" value={interval.hours} onChange={(e) => setInterval({...interval, hours: Number(e.target.value)})} />
          <TextField label="Minutes" type="number" value={interval.minutes} onChange={(e) => setInterval({...interval, minutes: Number(e.target.value)})} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}
export default EditPlotDialog;