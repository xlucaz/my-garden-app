import React from 'react';
import {
  Paper, Typography, List, ListItem, ListItemText,
  Divider, ListItemIcon, Tooltip, Box
} from '@mui/material';
import GrassIcon from '@mui/icons-material/Grass';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

function HarvestLog({ log }) {
  return (
    <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
      <Typography variant="h5" gutterBottom>Harvest Log</Typography>
      <List>
        {log.length > 0 ? (
          log.slice().reverse().map((entry, index) => {
            const actionText = entry.action === 'remove' ? 'Plant Removed' : 'Plant Kept';
            let details = entry.quantity ? `Quantity: ${entry.quantity} (${actionText})` : actionText;
            const formattedTimestamp = new Date(entry.timestamp).toLocaleString();
            
            const secondaryContent = (
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                 {/* FIX: The Typography is now a span */}
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
                {index < log.length - 1 && <Divider />}
              </React.Fragment>
            );
          })
        ) : (
          <ListItem>
            <ListItemText primary="No watering events logged yet." />
          </ListItem>
        )}
      </List>
    </Paper>
  );
}

export default HarvestLog;