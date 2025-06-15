import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Divider, Chip
} from '@mui/material';

function PlantDetailsDialog({ open, onClose, onHarvest, onEdit, plant, plotName }) {
  // This guard clause prevents rendering if no plant is selected.
  if (!plant) {
    return null;
  }

  const handleHarvestClick = () => {
    onHarvest(plant);
    onClose(); 
  };

  const handleEditClick = () => {
    onEdit(plant);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{plant.name}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Status</Typography>
            <Chip label={plant.status} size="small" color="primary" variant="outlined" />
        </Box>
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Plot</Typography>
            <Typography variant="body1">{plotName}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Date Planted</Typography>
            <Typography variant="body1">{new Date(plant.datePlanted).toLocaleDateString()}</Typography>
        </Box>

        {plant.estimatedHarvestDate && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Estimated Harvest</Typography>
            <Typography variant="body1">{new Date(plant.estimatedHarvestDate).toLocaleDateString()}</Typography>
          </Box>
        )}

        {plant.notes && plant.notes.length > 0 && (
           <Box>
            <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
            {plant.notes.map((note, index) => (
                <Typography key={index} variant="body2" sx={{ fontStyle: 'italic' }}>- {note}</Typography>
            ))}
           </Box>
        )}

      </DialogContent>
      <DialogActions sx={{ p: '16px 24px', justifyContent: 'space-between' }}>
        <Button onClick={handleEditClick}>Edit</Button>
        <Button onClick={handleHarvestClick} variant="contained" color="success">
          Log Harvest
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PlantDetailsDialog;