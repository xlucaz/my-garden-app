import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, CircularProgress } from '@mui/material';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

const AI_API_URL = 'http://localhost:3001/api/ai/ask';

function GardenPal({ plants, plots }) {

  const [tips, setTips] = useState({});
  const [loadingStates, setLoadingStates] = useState({});

  const fetchTipForPlant = async (plant) => {
    // Prevent fetching if a tip already exists or is loading
    if (tips[plant.id] || loadingStates[plant.id]) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, [plant.id]: true }));

    try {
      const question = `What is one important tip for a ${plant.name} plant that is currently in the ${plant.status} stage? Keep the answer to one sentence.`;
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      if (!response.ok) {
        throw new Error('AI service failed to respond.');
      }
      
      const data = await response.json();
      setTips(prev => ({ ...prev, [plant.id]: data.answer }));

    } catch (error) {
      console.error(`Failed to fetch tip for ${plant.name}:`, error);
      setTips(prev => ({ ...prev, [plant.id]: 'Could not fetch a tip at this time.' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [plant.id]: false }));
    }
  };
  
  const activePlants = plants.filter(p => !p.isRemoved);

  useEffect(() => {
    activePlants.forEach(plant => {
      fetchTipForPlant(plant);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plants]); // Rerun when the list of plants changes

  const getPlotName = (plotId) => {
    const plot = plots.find(p => p.id === plotId);
    return plot ? plot.name : 'your garden';
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }}}>
      <List>
        {activePlants.map((plant, index) => {
          const isLoading = loadingStates[plant.id];
          const tip = tips[plant.id];
          const plotName = getPlotName(plant.plotId);
          
          return (
            <React.Fragment key={plant.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <TipsAndUpdatesIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="h6">{plant.name} in "{plotName}"</Typography>}
                  secondary={
                    isLoading ? 
                    <CircularProgress size={20} sx={{ mt: 1 }} /> : 
                    <Typography variant="body2" sx={{ mt: 1 }}>{tip}</Typography>
                  }
                />
              </ListItem>
              {index < activePlants.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
}

export default GardenPal;