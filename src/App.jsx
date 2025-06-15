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
import GardenAI from './components/GardenAI';


const PLOTS_API_URL = 'http://localhost:3001/api/plots';
const PLANTS_API_URL = 'http://localhost:3001/api/plants';
const AI_PLANT_INFO_URL = 'http://localhost:3001/api/ai/plant-info';

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
  const [activeTab, setActiveTab] = useState(0);
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
         const [plotsRes, plantsRes, weatherRes, forecastRes] = await Promise.all([
          fetch(PLOTS_API_URL),
          fetch(PLANTS_API_URL),
          fetch(WEATHER_API_URL),
          fetch(FORECAST_API_URL)
        ]);
        if (!plotsRes.ok || !plantsRes.ok || !weatherRes.ok || !forecastRes.ok) {
            throw new Error('Failed to fetch data. Please check your API key and network connection.');
        }

        setPlots(await plotsRes.json());
        setPlants(await plantsRes.json());
        setWeather(await weatherRes.json());
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
    }
  };


const handleWaterPlot = (plotId) => {
    const plotToWater = plots.find(p => p.id === plotId);
    if (!plotToWater) return;

    // --- Part 1: Update the Plot's Schedule ---
    const previousPlots = [...plots];
    const updatedPlot = { ...plotToWater, nextWateringTime: Date.now() + plotToWater.wateringInterval };
    const updatedPlots = plots.map(p => p.id === plotId ? updatedPlot : p);
    setPlots(updatedPlots);
    handleSave(PLOTS_API_URL, updatedPlots, previousPlots, `Plot ${plotToWater.name} schedule updated!`);


    // --- Part 2: Update the Watering History for each Plant in the Plot ---
    const previousPlants = [...plants];
    const plantsToUpdate = plants.filter(p => p.plotId === plotId && !p.isRemoved);
    if (plantsToUpdate.length === 0) return; // No plants to log for

    const weatherSummary = weather ? {
        temp: weather.main.temp,
        description: weather.weather[0].description,
        icon: weather.weather[0].icon,
        humidity: weather.main.humidity
    } : null;

    const newWateringEntry = {
      timestamp: new Date().toISOString(),
      weather: weatherSummary,
    };

    const updatedPlants = plants.map(plant => {
      if (plantsToUpdate.some(p => p.id === plant.id)) {
        return {
          ...plant,
          wateringHistory: [...(plant.wateringHistory || []), newWateringEntry],
        };
      }
      return plant;
    });

    setPlants(updatedPlants);
    handleSave(PLANTS_API_URL, updatedPlants, previousPlants, `Watering logged for plants in ${plotToWater.name}!`);
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
    const plot = plots.find(p => p.id === plantObject.plotId);
    if (!plot) return;

    const previousPlants = [...plants];

    const newHarvest = {
      timestamp: new Date().toISOString(),
      quantity: quantity,
      action: action,
      weather: weather,
    };

    const updatedPlants = plants.map(p => {
      if (p.id === plantObject.id) {
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
    if (!plotToDelete) return; // Safety check
    const previousPlots = [...plots];
    const updatedPlots = plots.filter(p => p.id !== plotToDelete);
    setPlots(updatedPlots);
    handleSave(PLOTS_API_URL, updatedPlots, previousPlots, "Plot deleted successfully.");
    const previousPlants = [...plants];
    const updatedPlants = plants.filter(p => p.plotId !== plotToDelete);
    setPlants(updatedPlants);
    handleSave(PLANTS_API_URL, updatedPlants, previousPlants, "Associated plants removed.");
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

  const handleSaveNewPlant = async ({ name, status }) => {
    if (!plotToAddPlantTo) return;

    let newPlant = {
      id: Date.now(),
      plotId: plotToAddPlantTo.id,
      plotName: plotToAddPlantTo.name,
      name: name,
      status: status,
      icon: 'SpaIcon',
      datePlanted: new Date().toISOString(),
      isRemoved: false,
      wateringHistory: [],
      harvests: []
    };

    try {
      console.log(`Requesting maturity info for ${name} from local AI...`);
      const response = await fetch(AI_PLANT_INFO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantName: name })
      });

      if (response.ok) {
        const data = await response.json();
        const days = data.estimatedDaysToMaturity;
        const datePlanted = new Date(newPlant.datePlanted);
        const estimatedHarvestDate = new Date(datePlanted.setDate(datePlanted.getDate() + days));

        console.log(`Received from AI: ${days} days. Estimated harvest: ${estimatedHarvestDate.toISOString()}`);
        
        newPlant = {
          ...newPlant,
          estimatedDaysToMaturity: days,
          estimatedHarvestDate: estimatedHarvestDate.toISOString(),
        };
      }
    } catch (e) {
      console.error("Could not fetch AI-driven data:", e);
    }

    const previousPlants = [...plants];
    const updatedPlants = [...plants, newPlant];
    setPlants(updatedPlants);
    handleSave(PLANTS_API_URL, updatedPlants, previousPlants, `Added ${name} to ${plotToAddPlantTo.name}!`);

    const previousPlots = [...plots];
    const updatedPlots = plots.map(p => {
      if (p.id === plotToAddPlantTo.id) {
        const newPlantIds = [...(p.plantIds || []), newPlant.id];
        return { ...p, plantIds: newPlantIds };
      }
      return p;
    });

    setPlots(updatedPlots);
    handleSave(PLOTS_API_URL, updatedPlots, previousPlots, `Updated plot with new plant ID.`);
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
                <Tab label="Garden AI" />
            </Tabs>
        </Box>

        <Box sx={{ px: { xs: 2, sm: 3 } }}>
            <Header
              weather={weather}
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
                <WateringLog plants={plants} plots={plots} />
              </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <Box sx={{ px: { xs: 2, sm: 3 } }}>
                <HarvestLog plants={plants} plots={plots} />
              </Box>
            </TabPanel>

              <TabPanel value={activeTab} index={4}>
                <Box sx={{ px: { xs: 2, sm: 3 } }}>
                  <GardenAI plants={plants} plots={plots} />
                </Box>
            </TabPanel>
          </>
        )}
      </Container>
      
      <ConfirmDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={handleConfirmDelete} title="Delete Plot?" message="Are you sure you want to permanently delete this plot? This action cannot be undone." />
      {plotToEdit && (<EditPlotDialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} onSave={handleEditSave} plot={plotToEdit} />)}
      <HarvestDialog open={harvestDialogOpen} onClose={() => setHarvestDialogOpen(false)} onSave={handleSaveHarvest} plantName={harvestInfo?.plantObject?.name} />
              
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