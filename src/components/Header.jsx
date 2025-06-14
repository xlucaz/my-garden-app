import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, FormControlLabel, Switch } from '@mui/material';

const LATITUDE = 43.6532;
const LONGITUDE = -79.3832;
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${LATITUDE}&lon=${LONGITUDE}&appid=${API_KEY}&units=metric`;

function Header({ debugMode, onDebugToggle }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (!API_KEY || API_KEY === 'paste_your_api_key_here') return;
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        if (data.cod !== 200) throw new Error(data.message);
        setWeather({ temp: data.main.temp, description: data.weather[0].description, icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}.png` });
      })
      .catch(error => console.error("Failed to fetch weather:", error));
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography variant="h5">{currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Typography>
        <Typography variant="h4">{currentTime.toLocaleTimeString()}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControlLabel control={<Switch checked={debugMode} onChange={onDebugToggle} />} label="Debug Mode" />
        <Box sx={{ textAlign: 'right' }}>
          {weather ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h4">{Math.round(weather.temp)}°C</Typography>
              <Box>
                <img src={weather.icon} alt={weather.description} style={{ verticalAlign: 'middle' }} />
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{weather.description}</Typography>
              </Box>
            </Box>
          ) : (<Typography>Loading weather...</Typography>)}
        </Box>
      </Box>
    </Paper>
  );
}
export default Header;