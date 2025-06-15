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
import PlantDetailsDialog from './components/PlantDetailsDialog';
import EditPlantDialog from './components/EditPlantDialog';


const PLOTS_API_URL = '/api/plots';
const PLANTS_API_URL = '/api/plants';
const AI_API_URL = '/api/ai/ask';

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
  const [plantDetailsDialogOpen, setPlantDetailsDialogOpen] = useState(false);
  const [plantForDetails, setPlantForDetails] = useState(null);
  const [editPlantDialogOpen, setEditPlantDialogOpen] = useState(false);
  const [plantToEdit, setPlantToEdit] = useState(null);

  // State for AI tip queue
  const [aiTips, setAiTips] = useState({});
  const [tipRequestQueue, setTipRequestQueue] = useState([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);


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

        const plotsData = await plotsRes.json();
        const plantsData = await plantsRes.json();

        setPlots(plotsData);
        setPlants(plantsData);
        setWeather(await weatherRes.json());
        setForecast(await forecastRes.json());

        // Populate the AI tip request queue once plants are loaded
        const activePlants = plantsData.filter(p => !p.isRemoved);
        const requests = activePlants.map(plant => ({
            plantId: plant.id,
            question: `What is one important tip for a ${plant.name} plant that is currently in the ${plant.status} stage? Keep the answer to one sentence.`
        }));
        setTipRequestQueue(requests);

      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Effect to process the AI tip queue serially
  useEffect(() => {
    if (tipRequestQueue.length > 0 && !isAiProcessing) {
        setIsAiProcessing(true);
        const nextRequest = tipRequestQueue[0];

        const fetchTip = async () => {
            try {
                const response = await fetch(AI_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: nextRequest.question })
                });

                if (!response.ok) {
                    throw new Error('AI service failed to respond.');
                }
                
                const data = await response.json();
                setAiTips(prev => ({ ...prev, [nextRequest.plantId]: data.answer }));
            } catch (error) {
                console.error(`Failed to fetch tip for plant ID ${nextRequest.plantId}:`, error);
                setAiTips(prev => ({ ...prev, [nextRequest.plantId]: 'Could not fetch a tip at this time.' }));
            } finally {
                setTipRequestQueue(prev => prev.slice(1)); // Remove processed request
                setIsAiProcessing(false); // Free up the processor for the next request
            }
        };

        fetchTip();
    }
  }, [tipRequestQueue, isAiProcessing]);
  
  const handleSave = async (url, newData, previousData, successMessage) => {
// ... (rest of function is unchanged)
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
// ... (rest of function is unchanged)
    const plotToWater = plots.find(p => p.id === plotId);
    if (!plotToWater) return;

    const previousPlots = [...plots];
    const updatedPlot = { ...plotToWater, nextWateringTime: Date.now() + plotToWater.wateringInterval };
    const updatedPlots = plots.map(p => p.id === plotId ? updatedPlot : p);
    setPlots(updatedPlots);
    handleSave(PLOTS_API_URL, updatedPlots, previousPlots, `Plot ${plotToWater.name} schedule updated!`);

    const previousPlants = [...plants];
    const plantsToUpdate = plants.filter(p => p.plotId === plotId && !p.isRemoved);
    if (plantsToUpdate.length === 0) return; 

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
// ... (rest of function is unchanged)
    setHarvestInfo({
      plantObject: plant 
    });
    setHarvestDialogOpen(true);
  };
  
  const handleSaveHarvest = ({ quantity, action }) => {
// ... (rest of function is unchanged)
    if (!harvestInfo || !harvestInfo.plantObject) return;

    const { plantObject } = harvestInfo;
    const plot = plots.find(p => p.id === plantObject.plotId);
    if (!plot) return;

    const previousPlants = [...plants];
    
    const weatherSummary = weather ? {
        temp: weather.main.temp,
        description: weather.weather[0].description,
        icon: weather.weather[0].icon,
        humidity: weather.main.humidity
    } : null;

    const newHarvest = {
      timestamp: new Date().toISOString(),
      quantity: quantity,
      action: action,
      weather: weatherSummary,
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
// ... (rest of function is unchanged)
    if (!plotToDelete) return; 
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
// ... (rest of function is unchanged)
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
// ... (rest of handlers are unchanged)
  const handleAddPlot = () => {
    const interval = 86400000;
    const newPlotTemplate = { id: Date.now(), name: '', wateringInterval: interval, nextWateringTime: Date.now() + interval, soilType: 'Loam', plantIds: [] };
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

  const handleOpenAddPlantDialog = (plot) => {
    setPlotToAddPlantTo(plot);
    setAddPlantDialogOpen(true);
  };

  const handleCloseAddPlantDialog = () => {
    setAddPlantDialogOpen(false);
  };

  const handleSaveNewPlant = async ({ name, status }) => {
    if (!plotToAddPlantTo) return;

    let estimatedDaysToMaturity = undefined;
    let estimatedHarvestDate = undefined;
    
    try {
        const question = `On average, how many days does it take for a ${name} plant to reach maturity from a seed? Please respond with only a single number.`;
        const response = await fetch(AI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });
        if (response.ok) {
            const data = await response.json();
            const days = parseInt(data.answer, 10);
            if (!isNaN(days)) {
                estimatedDaysToMaturity = days;
                const datePlanted = new Date();
                estimatedHarvestDate = new Date(datePlanted.setDate(datePlanted.getDate() + days)).toISOString();
            }
        }
    } catch (e) {
        console.error("Could not fetch AI-driven maturity data:", e);
        setSnackbar({ open: true, message: 'Could not get AI data for maturity.', severity: 'info' });
    }

    const newPlant = {
      id: Date.now(),
      plotId: plotToAddPlantTo.id,
      name: name,
      status: status,
      icon: 'SpaIcon',
      datePlanted: new Date().toISOString(),
      isRemoved: false,
      wateringHistory: [],
      harvests: [],
      notes: [],
      estimatedDaysToMaturity,
      estimatedHarvestDate
    };
    
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

    const handleShowPlantDetails = (plant) => {
        setDetailsDialogOpen(false); 
        setPlantForDetails(plant);
        setPlantDetailsDialogOpen(true); 
    };

    const handleClosePlantDetails = () => {
        setPlantDetailsDialogOpen(false);
    };

    const handleEditPlant = (plant) => {
        setPlantToEdit(plant);
        setEditPlantDialogOpen(true);
    };

    const handleSavePlant = (editedPlant) => {
        const previousPlants = [...plants];
        const updatedPlants = plants.map(p => p.id === editedPlant.id ? editedPlant : p);
        setPlants(updatedPlants);
        handleSave(PLANTS_API_URL, updatedPlants, previousPlants, "Plant details updated!");
        setEditPlantDialogOpen(false);
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
                  <GardenAI plants={plants} plots={plots} aiTips={aiTips} />
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
        onPlantClick={handleShowPlantDetails}
      />

      <AddPlantDialog
        open={addPlantDialogOpen}
        onClose={handleCloseAddPlantDialog}
        onSave={handleSaveNewPlant}
      />

      <PlantDetailsDialog
        open={plantDetailsDialogOpen}
        onClose={handleClosePlantDetails}
        plant={plantForDetails}
        plotName={plots.find(p => p.id === plantForDetails?.plotId)?.name}
        onHarvest={handleHarvest}
        onEdit={handleEditPlant}
      />

      <EditPlantDialog
        open={editPlantDialogOpen}
        onClose={() => setEditPlantDialogOpen(false)}
        onSave={handleSavePlant}
        plant={plantToEdit}
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