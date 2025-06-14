import React from 'react';
import { Card, CardContent, CardActions, IconButton, Button, Box, Chip, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import FastForwardIcon from '@mui/icons-material/FastForward';
import HistoryIcon from '@mui/icons-material/History';
import WateringTimer from './WateringTimer';

function Plot({ plot, onRemove, onEdit, onWater, debugMode, onTimeShift }) {
  const isWateringDue = plot.nextWateringTime - Date.now() < 0;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="div">{plot.name}</Typography>
        <WateringTimer nextWateringTime={plot.nextWateringTime} wateringInterval={plot.wateringInterval} />
        <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap', mt: 2 }}>
          {plot.plants.map((plant, index) => plant ? <Chip key={index} label={plant} /> : null)}
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button variant="contained" startIcon={<WaterDropIcon />} onClick={() => onWater(plot.id)} color={isWateringDue ? 'success' : 'primary'}>Water Now</Button>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* This logic shows the buttons only when debugMode is true */}
          {debugMode && (
            <>
              <IconButton title="Rewind 2 hours" onClick={() => onTimeShift(plot.id, 2)}><HistoryIcon /></IconButton>
              <IconButton title="Fast-forward 2 hours" onClick={() => onTimeShift(plot.id, -2)}><FastForwardIcon /></IconButton>
            </>
          )}
          <IconButton aria-label="edit" onClick={() => onEdit(plot)}><EditIcon /></IconButton>
          <IconButton aria-label="delete" onClick={() => onRemove(plot.id)}><DeleteIcon /></IconButton>
        </Box>
      </CardActions>
    </Card>
  );
}

export default Plot;