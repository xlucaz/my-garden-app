import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Garden from './components/Garden';
import WateringLog from './components/WateringLog';
import HarvestLog from './components/HarvestLog';
import WeatherTab from './components/WeatherTab'; // Import the new component
import ConfirmDialog from './components/ConfirmDialog';
import EditPlotDialog from './components/EditPlotDialog';
import HarvestDialog from './components/HarvestDialog';
import { Container, CssBaseline, Box, Tabs, Tab, Button, Typography, CircularProgress, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const PLOTS_API_URL = 'http://localhost:3001/api/plots';
const WATERING_LOG_API_URL = 'http://localhost:3001/api/log';
const HARVEST_LOG_API_URL = 'http://localhost:3001/api/harvest_log';

const LATITUDE = 43.6532;
const LONGITUDE = -79.3832;
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${LATITUDE}&lon=${LONGITUDE}&appid=${API_KEY}&units=metric`;
const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${LATITUDE}&lon=${LONGITUDE}&appid=${API_KEY}&units=metric`;

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && (<Box sx={{ p: 3, pt: 2 }}>{children}</Box>)}
    </div>
  );
}

function App() {
  const [plots, setPlots] = useState([]);
  const [wateringLog, setWateringLog] = useState([]);
  const [harvestLog, setHarvestLog] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [plotToDelete, setPlotToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [plotToEdit, setPlotToEdit] = useState(null);
  const [harvestDialogOpen, setHarvestDialogOpen] = useState(false);
  const [harvestInfo, setHarvestInfo] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);   


useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true); // Start loading
      setError(null);     // Reset errors
      try {
        const [plotsRes, wateringLogRes, harvestLogRes] = await Promise.all([
          fetch(PLOTS_API_URL), fetch(WATERING_LOG_API_URL), fetch(HARVEST_LOG_API_URL)
        ]);
        setPlots(await plotsRes.json());
        setWateringLog(await wateringLogRes.json());
        setHarvestLog(await harvestLogRes.json());

        if (API_KEY && API_KEY !== 'paste_your_api_key_here') {
          const [weatherRes, forecastRes] = await Promise.all([
            fetch(WEATHER_API_URL), fetch(FORECAST_API_URL)
          ]);
          if (!weatherRes.ok || !forecastRes.ok) {
            // Throw an error if either API call fails, so we can catch it
            throw new Error('Failed to fetch weather data. Please check your API key and network connection.');
          }
          const weatherData = await weatherRes.json();
          setWeather(weatherData);
          setForecast(await forecastRes.json());
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        setError(err.message); // Set the error state
      } finally {
        setIsLoading(false); // Stop loading, whether it succeeded or failed
      }
    };
    fetchAllData();
  }, []);

  const savePlotsToServer = async (updatedPlots) => {
    try { await fetch(PLOTS_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedPlots) });
    } catch (error) { console.error('Failed to save plots:', error); }
  };

  const saveWateringLogToServer = async (updatedLog) => {
    try { await fetch(WATERING_LOG_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedLog) });
    } catch (error) { console.error('Failed to save log:', error); }
  };
  
  const saveHarvestLogToServer = async (updatedLog) => {
    try {
      await fetch(HARVEST_LOG_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLog),
      });
    } catch (error) { console.error('Failed to save harvest log:', error); }
  };

  const handleWaterPlot = (plotId) => {
    const plotToWater = plots.find(p => p.id === plotId);
    if (!plotToWater) return;
    const timeDifference = Date.now() - plotToWater.nextWateringTime;
    let status = 'On Time';
    const oneHour = 3600000;
    if (timeDifference > oneHour) { status = 'Late'; }
    else if (timeDifference < -oneHour) { status = 'Early'; }
    const newLogEntry = { 
      id: Date.now(), 
      plotName: plotToWater.name, 
      timestamp: new Date().toISOString(), 
      status: status, 
      timeDifference: timeDifference,
      weather: weather };

    const updatedLog = [...wateringLog, newLogEntry];
    setWateringLog(updatedLog);
    saveWateringLogToServer(updatedLog);
    const updatedPlot = { ...plotToWater, nextWateringTime: Date.now() + plotToWater.wateringInterval };
    const updatedPlots = plots.map(p => p.id === plotId ? updatedPlot : p);
    setPlots(updatedPlots);
    savePlotsToServer(updatedPlots);
  };

  const handleHarvest = (plotId, plantName) => {
    setHarvestInfo({ plotId, plantName });
    setHarvestDialogOpen(true);
  };

  const handleSaveHarvest = ({ quantity, action }) => {
    if (!harvestInfo) return;
    const { plotId, plantName } = harvestInfo;
    const plot = plots.find(p => p.id === plotId);

    const newLogEntry = { 
      id: Date.now(), 
      plotName: plot.name, 
      plantName: plantName, 
      timestamp: new Date().toISOString(), 
      quantity: quantity, 
      action: action,
      weather: weather };
    const updatedHarvestLog = [...harvestLog, newLogEntry];
    setHarvestLog(updatedHarvestLog);
    saveHarvestLogToServer(updatedHarvestLog);

    if (action === 'remove') {
      const updatedPlots = plots.map(p => {
        if (p.id === plotId) {
          return { ...p, plants: p.plants.filter(plant => plant !== plantName) };
        }
        return p;
      });
      setPlots(updatedPlots);
      savePlotsToServer(updatedPlots);
    }
  };
  
  const handleTimeShift = (plotId, hours) => {
    const plotToShift = plots.find(p => p.id === plotId);
    if (!plotToShift) return;
    const timeShiftInMs = hours * 3600000;
    const updatedPlot = { ...plotToShift, nextWateringTime: plotToShift.nextWateringTime + timeShiftInMs };
    const updatedPlots = plots.map(p => p.id === plotId ? updatedPlot : p);
    setPlots(updatedPlots);
    savePlotsToServer(updatedPlots);
  };
  
  const handleRemoveClick = (plotId) => { setPlotToDelete(plotId); setDeleteDialogOpen(true); };
  
  const handleConfirmDelete = () => {
    const updatedPlots = plots.filter(p => p.id !== plotToDelete);
    setPlots(updatedPlots);
    savePlotsToServer(updatedPlots);
    setDeleteDialogOpen(false);
    setPlotToDelete(null);
  };

  const handleEditClick = (plot) => { setPlotToEdit(plot); setEditDialogOpen(true); };

  const handleAddPlot = () => {
    const interval = 86400000;
    const newPlotTemplate = { id: Date.now(), name: '', plants: [], wateringInterval: interval, nextWateringTime: Date.now() + interval };
    setPlotToEdit(newPlotTemplate);
    setEditDialogOpen(true);
  };

  const handleEditSave = (plotDataFromDialog) => {
    const isExistingPlot = plots.some(p => p.id === plotDataFromDialog.id);
    let plotToSave = { ...plotDataFromDialog };

    if (!isExistingPlot || plotToSave.wateringInterval !== plots.find(p => p.id === plotToSave.id)?.wateringInterval) {
      plotToSave.nextWateringTime = Date.now() + plotToSave.wateringInterval;
    }
    
    const updatedPlots = isExistingPlot ? plots.map(p => (p.id === plotToSave.id ? plotToSave : p)) : [...plots, plotToSave];
    setPlots(updatedPlots);
    savePlotsToServer(updatedPlots);
    setEditDialogOpen(false);
    setPlotToEdit(null);
  };
  
  const handleTabChange = (event, newValue) => { setActiveTab(newValue); };

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Header 
        weather={weather}
        debugMode={debugMode} 
        onDebugToggle={() => setDebugMode(prev => !prev)}
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : (
          <>


        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="main tabs">
            <Tab label="My Garden" />
            <Tab label="Weather" />
            <Tab label="Watering Log" />
            <Tab label="Harvest Log" />
          </Tabs>
        </Box>
        
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h2">Your Plots</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddPlot}>Add Plot</Button>
          </Box>
          <Garden 
            plots={plots} 
            onRemove={handleRemoveClick} 
            onEdit={handleEditClick} 
            onWater={handleWaterPlot}
            debugMode={debugMode}
            onTimeShift={handleTimeShift}
            onHarvest={handleHarvest}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <WeatherTab forecast={forecast} />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <WateringLog log={wateringLog} />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <HarvestLog log={harvestLog} />
        </TabPanel>
          </>
        )}
      </Container>
      
      <ConfirmDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={handleConfirmDelete} title="Delete Plot?" message="Are you sure you want to permanently delete this plot? This action cannot be undone." />
      {plotToEdit && (<EditPlotDialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} onSave={handleEditSave} plot={plotToEdit} />)}
      
      <HarvestDialog
        open={harvestDialogOpen}
        onClose={() => setHarvestDialogOpen(false)}
        onSave={handleSaveHarvest}
        plantName={harvestInfo?.plantName}
      />
    </>
  );
}

export default App;