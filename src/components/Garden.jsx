import React from 'react';
import Plot from './Plot';
import { Grid } from '@mui/material';

function Garden({ plots, plants, onShowDetails }) {
  return (
    <Grid 
      container 
      spacing={3} 
      sx={{
        flexWrap: 'nowrap',
        overflowX: 'auto',
        pb: 2,
        '::-webkit-scrollbar': { height: '8px' }, 
        '::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px' } 
      }}
>
      {plots.map(plot => {
        const plantsForPlot = plants.filter(p => p.plotId === plot.id && !p.isRemoved);
        
        return (
          <Grid item key={plot.id} sx={{ minWidth: 300, maxWidth: 350 }}>
            <Plot 
              plot={plot} 
              plantsForPlot={plantsForPlot}
              onCardClick={onShowDetails} 
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

export default Garden;