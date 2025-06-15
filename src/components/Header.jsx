import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, FormControlLabel, Switch, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';


function Header({ weather, activeTab, onAddPlot }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography variant="h5">{currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Typography>
        <Typography variant="h4">{currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {activeTab === 0 && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAddPlot}>
            Add Plot
          </Button>
        )}
        <Box sx={{ textAlign: 'right' }}>
          {weather && weather.main && weather.weather ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h4">{Math.round(weather.main.temp)}°C</Typography>
              <Box>
                <img 
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`} 
                  alt={weather.weather[0].description} 
                  style={{ verticalAlign: 'middle' }} 
                />
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                  {weather.weather[0].description}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography>Loading weather...</Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default Header;