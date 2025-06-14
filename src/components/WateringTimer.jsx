import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// This helper is still used for the "Overdue" message
const formatTimeLeft = (ms) => {
  const totalSeconds = Math.abs(Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num) => String(num).padStart(2, '0');
  
  if (days > 0) {
    return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

function WateringTimer({ nextWateringTime, wateringInterval }) {
  const [timeLeft, setTimeLeft] = useState(nextWateringTime - Date.now());

  // This useEffect is still necessary to update the progress bar
  // and check if the timer is overdue.
  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft(nextWateringTime - Date.now());
    }, 1000);

    return () => clearInterval(timerId);
  }, [nextWateringTime]);

  const isOverdue = timeLeft < 0;
  const progress = Math.min(100, Math.max(0, ((wateringInterval - timeLeft) / wateringInterval) * 100));

  // Options for formatting the date and time nicely.
  const timeFormatOptions = {
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit'
  };

  return (
    <Box sx={{ mt: 2, mb: 1 }}>
      {isOverdue ? (
        // The overdue display remains the same, as it's very useful.
        <Chip 
          icon={<WarningAmberIcon />} 
          label={`Overdue by ${formatTimeLeft(timeLeft)}`}
          color="error" 
          sx={{ mb: 1 }}
        />
      ) : (
        // --- THIS IS THE CHANGE ---
        // Instead of the countdown, we show a static goal time.
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Next watering at: {new Date(nextWateringTime).toLocaleString(undefined, timeFormatOptions)}
        </Typography>
      )}
      <LinearProgress 
        variant="determinate" 
        value={progress}
        color={isOverdue ? 'error' : 'primary'}
        sx={{ height: 8, borderRadius: 5 }}
      />
    </Box>
  );
}

export default WateringTimer;