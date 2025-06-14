import React from 'react';
import Plot from './Plot';
import { Grid } from '@mui/material';

function Garden({ plots, onRemove, onEdit, onWater, debugMode, onTimeShift }) {
  return (
    <Grid container spacing={3}>
      {plots.map(plot => (
        <Grid key={plot.id} xs={12} sm={6} md={4}>
          <Plot 
            plot={plot} 
            onRemove={onRemove} 
            onEdit={onEdit} 
            onWater={onWater}
            debugMode={debugMode}
            onTimeShift={onTimeShift}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default Garden;