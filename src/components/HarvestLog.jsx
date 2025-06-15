import React from 'react';
import {
  Paper, Typography, List, ListItem, ListItemText,
  Divider, ListItemIcon, Tooltip, Box
} from '@mui/material';
import GrassIcon from '@mui/icons-material/Grass';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

/**
 * Displays a log of all harvest events from all plants.
 * @param {object} props
 * @param {Array} props.plants - The array of all plant objects.
 * @param {Array} props.plots - The array of all plot objects.
 */
function HarvestLog({ plants, plots }) {
  // 1. Create a flat, combined log by iterating through each plant's harvest history.
  const combinedLog = plants.flatMap(plant => {
    const plot = plots.find(p => p.id === plant.plotId);
    // 2. For each harvest, create a new object with all necessary info for display.
    return plant.harvests.map(entry => ({
      ...entry,
      id: `${plant.id}-${entry.timestamp}`, // Create a unique key for React
      plantName: plant.name,
      plotName: plot ? plot.name : 'Unknown Plot',
    }));
  });

  // 3. Sort the combined log by date, showing the most recent harvests first.
  const sortedLog = combinedLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
      <Typography variant="h5" gutterBottom>Harvest Log</Typography>
      <List>
        {sortedLog.length > 0 ? (
          sortedLog.map((entry, index) => {
            const actionText = entry.action === 'remove' ? 'Plant Removed' : 'Plant Kept';
            let details = entry.quantity ? `Quantity: ${entry.quantity} (${actionText})` : actionText;
            const formattedTimestamp = new Date(entry.timestamp).toLocaleString();
            
            const secondaryContent = (
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                 <Typography component="span" variant="body2" color="text.secondary">
                   {`${details} · ${formattedTimestamp}`}
                 </Typography>
                 {entry.weather && entry.weather.main && entry.weather.weather && (
                   <Tooltip title={entry.weather.weather[0].description}>
                     <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', ml: 1.5, opacity: 0.7 }}>
                       <img src={`https://openweathermap.org/img/wn/${entry.weather.weather[0].icon}.png`} alt={entry.weather.weather[0].description} style={{ width: 22, height: 22, marginRight: '4px' }} />
                       <Typography component="span" variant="body2" color="text.secondary">{Math.round(entry.weather.main.temp)}°C</Typography>
                     </Box>
                   </Tooltip>
                 )}
              </Box>
            );

            return (
              <React.Fragment key={entry.id}>
                <ListItem>
                  <ListItemIcon>
                    {entry.action === 'remove' ? 
                      <RemoveCircleOutlineIcon color="action" /> : 
                      <GrassIcon color="success" />
                    }
                  </ListItemIcon>
                  <ListItemText
                    primary={`Harvested ${entry.plantName} from "${entry.plotName}"`}
                    secondary={secondaryContent}
                  />
                </ListItem>
                {index < sortedLog.length - 1 && <Divider />}
              </React.Fragment>
            );
          })
        ) : (
          <ListItem>
            {/* Updated message to be consistent */}
            <ListItemText primary="No harvest events logged yet." />
          </ListItem>
        )}
      </List>
    </Paper>
  );
}

export default HarvestLog;