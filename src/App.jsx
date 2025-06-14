import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Garden from './components/Garden';
import WateringLog from './components/WateringLog';
import ConfirmDialog from './components/ConfirmDialog';
import EditPlotDialog from './components/EditPlotDialog';
import { Container, CssBaseline, Box, Tabs, Tab, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const PLOTS_API_URL = 'http://localhost:3001/api/plots';
const LOG_API_URL = 'http://localhost:3001/api/log';

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
  const [log, setLog] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [plotToDelete, setPlotToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [plotToEdit, setPlotToEdit] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plotsRes, logRes] = await Promise.all([ fetch(PLOTS_API_URL), fetch(LOG_API_URL) ]);
        const plotsData = await plotsRes.json();
        const logData = await logRes.json();
        setPlots(plotsData);
        setLog(logData);
      } catch (error) { console.error('Failed to fetch initial data:', error); }
    };
    fetchData();
  }, []);

  const savePlotsToServer = async (updatedPlots) => {
    try { await fetch(PLOTS_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedPlots) });
    } catch (error) { console.error('Failed to save plots:', error); }
  };
  
  const saveLogToServer = async (updatedLog) => {
    try { await fetch(LOG_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedLog) });
    } catch (error) { console.error('Failed to save log:', error); }
  };

  const handleWaterPlot = (plotId) => {
    const plotToWater = plots.find(p => p.id === plotId);
    if (!plotToWater) return;

    const timeDifference = Date.now() - plotToWater.nextWateringTime;
    let status = 'On Time';
    const oneHour = 3600000;
    if (timeDifference > oneHour) { status = 'Late'; }
    else if (timeDifference < -oneHour) { status = 'Early'; }
    
    const newLogEntry = { id: Date.now(), plotName: plotToWater.name, timestamp: new Date().toISOString(), status: status, timeDifference: timeDifference };
    const updatedLog = [...log, newLogEntry];
    setLog(updatedLog);
    saveLogToServer(updatedLog);

    const updatedPlot = { ...plotToWater, nextWateringTime: Date.now() + plotToWater.wateringInterval };
    const updatedPlots = plots.map(p => p.id === plotId ? updatedPlot : p);
    setPlots(updatedPlots);
    savePlotsToServer(updatedPlots);
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
        <Header debugMode={debugMode} onDebugToggle={() => setDebugMode(prev => !prev)} />
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}><Tab label="My Garden" /><Tab label="Watering Log" /></Tabs>
        </Box>
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h2">Your Plots</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddPlot}>Add Plot</Button>
          </Box>
          <Garden plots={plots} onRemove={handleRemoveClick} onEdit={handleEditClick} onWater={handleWaterPlot} debugMode={debugMode} onTimeShift={handleTimeShift} />
        </TabPanel>
        <TabPanel value={activeTab} index={1}><WateringLog log={log} /></TabPanel>
      </Container>
      <ConfirmDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={handleConfirmDelete} title="Delete Plot?" message="Are you sure...?" />
      {plotToEdit && (<EditPlotDialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} onSave={handleEditSave} plot={plotToEdit} />)}
    </>
  );
}
export default App;