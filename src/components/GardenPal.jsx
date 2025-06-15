import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, CircularProgress } from '@mui/material';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

function GardenPal({ plants, plots, aiTips }) {
  
  const activePlants = plants.filter(p => !p.isRemoved);

  const getPlotName = (plotId) => {
    const plot = plots.find(p => p.id === plotId);
    return plot ? plot.name : 'your garden';
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }}}>
      <List>
        {activePlants.map((plant, index) => {
          const tip = aiTips[plant.id];
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
                    tip ? 
                    <Typography variant="body2" sx={{ mt: 1 }}>{tip}</Typography> :
                    <CircularProgress size={20} sx={{ mt: 1 }} /> 
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