import React, { useState } from 'react';
import { Paper, Typography, Box, Accordion, AccordionSummary, AccordionDetails, Grid, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import AirIcon from '@mui/icons-material/Air';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WbCloudyOutlinedIcon from '@mui/icons-material/WbCloudyOutlined';
import UmbrellaOutlinedIcon from '@mui/icons-material/UmbrellaOutlined';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';


const groupForecastsByDay = (list) => {
  if (!list) return {};
  return list.reduce((acc, forecast) => {
    const date = new Date(forecast.dt * 1000).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(forecast);
    return acc;
  }, {});
};

const calculateDailySummary = (dayForecasts) => {
  const temps = dayForecasts.map(f => f.main.temp);
  const precipitations = dayForecasts.map(f => f.pop);
  const iconCounts = dayForecasts.reduce((acc, f) => {
    const icon = f.weather[0].icon.replace('n', 'd');
    acc[icon] = (acc[icon] || 0) + 1;
    return acc;
  }, {});
  const modeIcon = Object.keys(iconCounts).reduce((a, b) => iconCounts[a] > iconCounts[b] ? a : b);
  const modeDescription = dayForecasts.find(f => f.weather[0].icon.replace('n', 'd') === modeIcon).weather[0].description;
  return {
    highTemp: Math.round(Math.max(...temps)),
    lowTemp: Math.round(Math.min(...temps)),
    maxPrecipitation: Math.round(Math.max(...precipitations) * 100),
    modeIcon,
    modeDescription,
  };
};

const getWindDirection = (deg) => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(deg / 22.5) % 16];
};

const ForecastCard = ({ item }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const cardStyle = {
    flex: '0 0 120px',
    height: '170px',
    perspective: '1000px',
    cursor: 'pointer',
    position: 'relative', 
    '&:hover .flip-icon': { 
        opacity: 1,
    }
  };

  const cardInnerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    transition: 'transform 0.6s',
    transformStyle: 'preserve-3d',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  };

  const faceStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    p: 1,
    borderRadius: 2,
  };
  
  const flipIconStyle = {
    position: 'absolute',
    top: '4px',
    right: '4px',
    zIndex: 5,
    opacity: 0,
    transition: 'opacity 0.3s',
    color: 'action.active',
  }

  return (
    <Box sx={cardStyle} onClick={() => setIsFlipped(!isFlipped)}>

      <FlipCameraAndroidIcon className="flip-icon" sx={flipIconStyle} />

      <Box sx={cardInnerStyle}>
  
        <Paper elevation={2} sx={{ ...faceStyle, backgroundColor: 'background.paper' }}>
          <Typography variant="subtitle2">
            {new Date(item.dt * 1000).toLocaleTimeString(undefined, { hour: 'numeric' })}
          </Typography>
          <img src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`} alt="" style={{ width: '60px', height: '60px' }}/>
          <Typography variant="h6">{Math.round(item.main.temp)}°C</Typography>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'info.main' }}>
            <UmbrellaOutlinedIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
            {(item.pop * 100).toFixed(0)}%
          </Typography>
        </Paper>


        <Paper elevation={4} sx={{ ...faceStyle, transform: 'rotateY(180deg)', backgroundColor: theme => theme.palette.background.paper, fontSize: '0.75rem' }}>
          <Typography variant="body2" sx={{textTransform: 'capitalize', mb: 1, fontWeight: 'bold'}}>{item.weather[0].description}</Typography>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}><ThermostatIcon fontSize="small" sx={{ mr: 0.5 }}/>Feels like {Math.round(item.main.feels_like)}°</Typography>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}><WaterDropOutlinedIcon fontSize="small" sx={{ mr: 0.5 }}/>{item.main.humidity}% Humidity</Typography>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}><WbCloudyOutlinedIcon fontSize="small" sx={{ mr: 0.5 }}/>{item.clouds.all}% Cloud Cover</Typography>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}><AirIcon fontSize="small" sx={{ mr: 0.5 }}/>{item.wind.speed.toFixed(1)} m/s {getWindDirection(item.wind.deg)}</Typography>
        </Paper>
      </Box>
    </Box>
  );
};

function WeatherTab({ forecast }) {
  const [expanded, setExpanded] = useState(false);
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  if (!forecast) {
    return <Typography>Loading forecast...</Typography>;
  }

  const groupedForecasts = groupForecastsByDay(forecast.list);
  const forecastDays = Object.keys(groupedForecasts);

  return (
    <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ px: 2 }}>5-Day Forecast</Typography>
      <Typography variant="h6" gutterBottom sx={{ px: 2, mb: 2 }}>
        For: {forecast.city.name}, {forecast.city.country}
      </Typography>
      
      {forecastDays.map((day, index) => {
        const dayForecasts = groupedForecasts[day];
        const summary = calculateDailySummary(dayForecasts);
        const isExpanded = expanded === false ? index === 0 : expanded === day;

        return (
          <Accordion key={day} expanded={isExpanded} onChange={handleAccordionChange(day)} sx={{ '&:before': { display: 'none' } }} elevation={0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${day}-content`} id={`${day}-header`}>
              <Grid container alignItems="center" spacing={1}>
                <Grid item xs={12} sm={4}><Typography sx={{ fontWeight: 'bold' }}>{day}</Typography></Grid>
                <Grid item xs={6} sm={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'center' } }}>
                  <Tooltip title={summary.modeDescription}><img src={`https://openweathermap.org/img/wn/${summary.modeIcon}@2x.png`} alt={summary.modeDescription} style={{ width: 40, height: 40 }}/></Tooltip>
                  <Typography sx={{ textTransform: 'capitalize', ml: 1, display: { xs: 'none', sm: 'block' } }}>{summary.modeDescription}</Typography>
                </Grid>
                <Grid item xs={6} sm={4} textAlign="right">
                  <Typography variant="body2">High: {summary.highTemp}° / Low: {summary.lowTemp}°</Typography>
                  <Typography variant="body2" color="text.secondary">Precip: {summary.maxPrecipitation}%</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: 'action.hover', p: 2 }}>
              <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, pb: 1, '::-webkit-scrollbar': { height: '8px' }, '::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px' } }}>
                {dayForecasts.map((item) => (
                  <ForecastCard key={item.dt} item={item} />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Paper>
  );
}

export default WeatherTab;