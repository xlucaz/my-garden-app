import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton,
  Box, Chip, Typography, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import FastForwardIcon from '@mui/icons-material/FastForward';
import HistoryIcon from '@mui/icons-material/History';


function PlotDetailsDialog({ plot, open, onClose, plants, onWater, onEdit, onRemove, debugMode, onTimeShift, onHarvest, onAddPlant }) {
  if (!plot) return null;

  const plantsForPlot = plants.filter(p => p.plotId === plot.id && !p.isRemoved);
  const isWateringDue = plot.nextWateringTime - Date.now() < 0;

  const handleAddPlantClick = () => {
    onClose();
    onAddPlant(plot);
  };

  const handleEdit = () => {
    onClose();
    onEdit(plot);
  };

  const handleRemove = () => {
    onClose();
    onRemove(plot.id);
  };
  
  const handleWater = () => {
    onClose();
    onWater(plot.id);
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{plot.name}</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, color: 'text.secondary' }}>
          Plants:
        </Typography>
        <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap', mb: 2 }}>
          {plantsForPlot.length > 0 ? (
            plantsForPlot.map((plant) => (
              <Chip
                key={plant.id}
                label={plant.name}
                // UPDATED: Added the onClick handler to use the 'plant' and 'onHarvest' variables
                onClick={() => {
                  onClose();
                  onHarvest(plant);
                }}
                color="secondary"
              />
            ))
          ) : (
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              This plot has no plants.
            </Typography>
          )}
        </Box>
        
        {plantsForPlot.length < 3 && (
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddPlantClick} size="small">
                Add Plant
            </Button>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: '16px 24px', justifyContent: 'space-between' }}>
        <Button variant="contained" startIcon={<WaterDropIcon />} onClick={handleWater} color={isWateringDue ? 'success' : 'primary'}>
            Water Now
        </Button>
        <Box>
            {debugMode && (
                <>
                <IconButton title="Rewind 2 hours" onClick={() => onTimeShift(plot.id, 2)}><HistoryIcon /></IconButton>
                <IconButton title="Fast-forward 2 hours" onClick={() => onTimeShift(plot.id, -2)}><FastForwardIcon /></IconButton>
                </>
            )}
            <IconButton aria-label="edit" onClick={handleEdit}><EditIcon /></IconButton>
            <IconButton aria-label="delete" onClick={handleRemove}><DeleteIcon /></IconButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default PlotDetailsDialog;