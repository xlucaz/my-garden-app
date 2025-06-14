import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Divider, Tooltip, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Helper to format milliseconds into a readable string for the log
const formatTimeDifference = (ms) => {
  if (Math.abs(ms) < 60000) return 'less than a minute';
  const totalSeconds = Math.abs(Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  let parts = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  
  return parts.join(', ');
};

const StatusChip = ({ status, timeDifference }) => {
  let icon, color, label;
  switch (status) {
    case 'Late':
      icon = <WarningAmberIcon />;
      color = 'warning';
      label = `Late by ${formatTimeDifference(timeDifference)}`;
      break;
    case 'Early':
      icon = <InfoOutlinedIcon />;
      color = 'info';
      label = `Early by ${formatTimeDifference(timeDifference)}`;
      break;
    default:
      icon = <CheckCircleOutlineIcon />;
      color = 'success';
      label = 'Watered on time';
      break;
  }
  return <Chip icon={icon} label={label} color={color} size="small" />;
};

function WateringLog({ plants, plots }) {
  // 1. Create a flat, combined log from all plants
  const combinedLog = plants.flatMap(plant => {
    const plot = plots.find(p => p.id === plant.plotId);
    return plant.wateringHistory.map(entry => ({
      ...entry,
      id: `${plant.id}-${entry.timestamp}`, // Create a unique key
      plantName: plant.name,
      plotName: plot ? plot.name : 'Unknown Plot',
    }));
  });

  // 2. Sort the combined log by date, newest first
  const sortedLog = combinedLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
      <Typography variant="h5" gutterBottom>Watering Log</Typography>
      <List>
        {sortedLog.length > 0 ? (
          sortedLog.map((entry, index) => (
            <React.Fragment key={entry.id}>
              <ListItem>
                <ListItemText
                  primary={`Watered ${entry.plantName} in "${entry.plotName}"`}
                  secondary={
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Typography component="span" variant="body2" color="text.secondary">
                        {new Date(entry.timestamp).toLocaleString()}
                      </Typography>
                      {/* Weather display logic remains the same */}
                      {entry.weather && entry.weather.main && entry.weather.weather && (
                        <Tooltip title={entry.weather.weather[0].description}>
                          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', ml: 1.5, opacity: 0.7 }}>
                            <img src={`https://openweathermap.org/img/wn/${entry.weather.weather[0].icon}.png`} alt={entry.weather.weather[0].description} style={{ width: 22, height: 22, marginRight: '4px' }} />
                            <Typography component="span" variant="body2" color="text.secondary">{Math.round(entry.weather.main.temp)}°C</Typography>
                          </Box>
                                      </Tooltip>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < sortedLog.length - 1 && <Divider />}
            </React.Fragment>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No watering events logged yet." />
          </ListItem>
        )}
      </List>
    </Paper>
  );
}

export default WateringLog;