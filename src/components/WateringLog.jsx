import React from 'react';
import {
  Paper, Typography, List, ListItem, ListItemText,
  Divider, ListItemIcon, Chip
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Helper to format milliseconds into a readable string for the log
const formatTimeDifference = (ms) => {
  if (Math.abs(ms) < 60000) return 'less than a minute'; // Less than a minute
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
    default: // On Time
      icon = <CheckCircleOutlineIcon />;
      color = 'success';
      label = 'Watered on time';
      break;
  }
  return <Chip icon={icon} label={label} color={color} size="small" />;
};

function WateringLog({ log }) {
  return (
    <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
      <Typography variant="h5" gutterBottom>Watering Log</Typography>
      <List>
        {log.length > 0 ? (
          log.slice().reverse().map((entry, index) => (
            <React.Fragment key={entry.id}>
              <ListItem>
                <ListItemIcon>
                  {
                    {
                      'Late': <WarningAmberIcon color="warning" />,
                      'Early': <InfoOutlinedIcon color="info" />,
                      'On Time': <CheckCircleOutlineIcon color="success" />
                    }[entry.status]
                  }
                </ListItemIcon>
                <ListItemText
                  primary={`Watered "${entry.plotName}"`}
                  secondary={new Date(entry.timestamp).toLocaleString()}
                />
                <StatusChip status={entry.status} timeDifference={entry.timeDifference} />
              </ListItem>
              {index < log.length - 1 && <Divider />}
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