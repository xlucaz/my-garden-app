import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Garden from './components/Garden';
import WateringLog from './components/WateringLog';
import HarvestLog from './components/HarvestLog';
import WeatherTab from './components/WeatherTab';
import ConfirmDialog from './components/ConfirmDialog';
import EditPlotDialog from './components/EditPlotDialog';
import HarvestDialog from './components/HarvestDialog';
import { Container, CssBaseline, Box, Tabs, Tab, Button, Typography, CircularProgress, Alert, Snackbar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlotDetailsDialog from './components/PlotDetailsDialog';
import AddPlantDialog from './components/AddPlantDialog';

const PLOTS_API_URL = 'http://localhost:3001/api/plots';
const WATERING_LOG_API_URL = 'http://localhost:3001/api/log';
const HARVEST_LOG_API_URL = 'http://localhost:3001/api/harvest_log';
const PLANTS_API_URL = 'http://localhost:3001/api/plants';

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
  const [plants, setPlants] = useState([]);
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [plotForDetails, setPlotForDetails] = useState(null);
  const [addPlantDialogOpen, setAddPlantDialogOpen] = useState(false);
  const [plotToAddPlantTo, setPlotToAddPlantTo] = useState(null);


useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [plotsRes, plantsRes, wateringLogRes, harvestLogRes] = await Promise.all([
          fetch(PLOTS_API_URL),
          fetch(PLANTS_API_URL),
          fetch(WATERING_LOG_API_URL),
          fetch(HARVEST_LOG_API_URL)
        ]);
        setPlots(await plotsRes.json());
        setPlants(await plantsRes.json()); 
        setWateringLog(await wateringLogRes.json());
        setHarvestLog(await harvestLogRes.json());

        const [weatherRes, forecastRes] = await Promise.all([
            fetch(WEATHER_API_URL), fetch(FORECAST_API_URL)
        ]);

        if (!weatherRes.ok || !forecastRes.ok) {
            throw new Error('Failed to fetch weather data. Please check your API key and network connection.');
        }
        const weatherData = await weatherRes.json();
        setWeather(weatherData);
        setForecast(await forecastRes.json());

      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);
  
  // UPDATED: Generic function to handle saving state and showing snackbars
  const handleSave = async (url, newData, previousData, successMessage) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      if (!response.ok) {
        throw new Error(`Failed to save: ${response.statusText}`);
      }
      setSnackbar({ open: true, message: successMessage, severity: 'success' });
    } catch (error) {
      console.error('Failed to save data:', error);
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
      if (url === PLOTS_API_URL) setPlots(previousData);
      if (url === PLANTS_API_URL) setPlants(previousData);
      if (url === WATERING_LOG_API_URL) setWateringLog(previousData);
      if (url === HARVEST_LOG_API_URL) setHarvestLog(previousData);
    }
  };


  const handleWaterPlot = (plotId) => {
    const plotToWater = plots.find(p => p.id === plotId);
    if (!plotToWater) return;

    const previousPlots = [...plots];
    const previousWateringLog = [...wateringLog];

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
      weather: weather 
    };

    const updatedLog = [...wateringLog, newLogEntry];
    setWateringLog(updatedLog);

    const updatedPlot = { ...plotToWater, nextWateringTime: Date.now() + plotToWater.wateringInterval };
    const updatedPlots = plots.map(p => p.id === plotId ? updatedPlot : p);
    setPlots(updatedPlots);

    // Save both logs and plots
    handleSave(WATERING_LOG_API_URL, updatedLog, previousWateringLog, "Watering event logged!");
    handleSave(PLOTS_API_URL, updatedPlots, previousPlots, "Plot updated!");
  };

  const handleHarvest = (plant) => {
    setHarvestInfo({
      plantObject: plant // Store the whole object
    });
    setHarvestDialogOpen(true);
  };
  
const handleSaveHarvest = ({ quantity, action }) => {
    if (!harvestInfo || !harvestInfo.plantObject) return;

    const { plantObject } = harvestInfo;
    const previousPlants = [...plants];

    const updatedPlants = plants.map(p => {
      if (p.id === plantObject.id) {
        const newHarvest = {
          date: new Date().toISOString(),
          quantity: quantity,
        };
        return {
          ...p,
          harvests: [...p.harvests, newHarvest],
          isRemoved: action === 'remove' ? true : p.isRemoved,
        };
      }
      return p;
    });

    setPlants(updatedPlants);
    handleSave(PLANTS_API_URL, updatedPlants, previousPlants, "Harvest logged successfully!");
  };
  
  const handleConfirmDelete = () => {
    const previousPlots = [...plots];
    const updatedPlots = plots.filter(p => p.id !== plotToDelete);
    setPlots(updatedPlots);
    handleSave(PLOTS_API_URL, updatedPlots, previousPlots, "Plot deleted successfully.");
    setDeleteDialogOpen(false);
    setPlotToDelete(null);
  };
  
  const handleEditSave = (plotDataFromDialog) => {
    const previousPlots = [...plots];
    const isExistingPlot = plots.some(p => p.id === plotDataFromDialog.id);
    let plotToSave = { ...plotDataFromDialog };

    if (!isExistingPlot || plotToSave.wateringInterval !== plots.find(p => p.id === plotToSave.id)?.wateringInterval) {
      plotToSave.nextWateringTime = Date.now() + plotToSave.wateringInterval;
    }
    
    const updatedPlots = isExistingPlot ? plots.map(p => (p.id === plotToSave.id ? plotToSave : p)) : [...plots, plotToSave];
    setPlots(updatedPlots);
    handleSave(PLOTS_API_URL, updatedPlots, previousPlots, isExistingPlot ? "Plot updated!" : "Plot added!");
    setEditDialogOpen(false);
    setPlotToEdit(null);
  };

  // --- Other handlers (no changes needed) ---
  const handleTimeShift = (plotId, hours) => {
    const previousPlots = [...plots];
    const plotToShift = plots.find(p => p.id === plotId);
    if (!plotToShift) return;
    const timeShiftInMs = hours * 3600000;
    const updatedPlot = { ...plotToShift, nextWateringTime: plotToShift.nextWateringTime + timeShiftInMs };
    const updatedPlots = plots.map(p => p.id === plotId ? updatedPlot : p);
    setPlots(updatedPlots);
    handleSave(PLOTS_API_URL, updatedPlots, previousPlots, "Time shifted for plot.");
  };

  const handleRemoveClick = (plotId) => { setPlotToDelete(plotId); setDeleteDialogOpen(true); };
  const handleAddPlot = () => {
    const interval = 86400000;
    const newPlotTemplate = { id: Date.now(), name: '', plants: [], wateringInterval: interval, nextWateringTime: Date.now() + interval };
    setPlotToEdit(newPlotTemplate);
    setEditDialogOpen(true);
  };
  const handleEditClick = (plot) => { setPlotToEdit(plot); setEditDialogOpen(true); };
  const handleTabChange = (event, newValue) => { setActiveTab(newValue); };
  const handleSnackbarClose = () => { setSnackbar({ ...snackbar, open: false }); };

    const handleShowDetails = (plot) => {
    setPlotForDetails(plot);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
  };

useEffect(() => {
    if (activeTab === 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [activeTab]);

  const handleOpenAddPlantDialog = (plot) => {
    setPlotToAddPlantTo(plot);
    setAddPlantDialogOpen(true);
  };

  const handleCloseAddPlantDialog = () => {
    setAddPlantDialogOpen(false);
  };

  const handleSaveNewPlant = (plantName) => {
    if (!plotToAddPlantTo) return;

    const newPlant = {
      id: Date.now(),
      plotId: plotToAddPlantTo.id,
      name: plantName,
      // For now, we can hardcode a default icon name
      icon: 'SpaIcon', 
      datePlanted: new Date().toISOString(),
      isRemoved: false,
      harvests: []
    };

    const previousPlants = [...plants];
    const updatedPlants = [...plants, newPlant];
    setPlants(updatedPlants);
    handleSave(PLANTS_API_URL, updatedPlants, previousPlants, `Added ${plantName} to ${plotToAddPlantTo.name}!`);
  };

 return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }} disableGutters>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4, px: { xs: 2, sm: 3 } }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="main tabs" variant="scrollable" scrollButtons="auto">
                <Tab label="My Garden" />
                <Tab label="Weather" />
                <Tab label="Watering Log" />
                <Tab label="Harvest Log" />
            </Tabs>
        </Box>

        <Box sx={{ px: { xs: 2, sm: 3 } }}>
            <Header
              weather={weather}
              debugMode={debugMode}
              onDebugToggle={() => setDebugMode(prev => !prev)}
              activeTab={activeTab}
              onAddPlot={handleAddPlot}
            />
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2, mx: { xs: 2, sm: 3 } }}>{error}</Alert>
        ) : (
          <>
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ px: { xs: 2, sm: 3 } }}>
             <Garden
                  plots={plots}
                  plants={plants} 
                  onShowDetails={handleShowDetails}
                  onAddPlant={handleOpenAddPlantDialog}
                />
              </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Box sx={{ px: { xs: 2, sm: 3 } }}>
                <WeatherTab forecast={forecast} />
              </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <Box sx={{ px: { xs: 2, sm: 3 } }}>
                <WateringLog log={wateringLog} />
              </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <Box sx={{ px: { xs: 2, sm: 3 } }}>
                <HarvestLog log={harvestLog} />
              </Box>
            </TabPanel>
          </>
        )}
      </Container>
      
      <ConfirmDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={handleConfirmDelete} title="Delete Plot?" message="Are you sure you want to permanently delete this plot? This action cannot be undone." />
      {plotToEdit && (<EditPlotDialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} onSave={handleEditSave} plot={plotToEdit} />)}
      <HarvestDialog open={harvestDialogOpen} onClose={() => setHarvestDialogOpen(false)} onSave={handleSaveHarvest} plantName={harvestInfo?.plantName} />
      
      <PlotDetailsDialog
        plot={plotForDetails}
        open={detailsDialogOpen}
        onClose={handleCloseDetails}
        plants={plants} 
        onAddPlant={handleOpenAddPlantDialog}
        onWater={handleWaterPlot}
        onEdit={handleEditClick}
        onRemove={handleRemoveClick}
        onHarvest={handleHarvest}
        onTimeShift={handleTimeShift}
        debugMode={debugMode}
      />

      <AddPlantDialog
        open={addPlantDialogOpen}
        onClose={handleCloseAddPlantDialog}
        onSave={handleSaveNewPlant}
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default App;