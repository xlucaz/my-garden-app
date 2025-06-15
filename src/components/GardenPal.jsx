import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider } from '@mui/material';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

/**
 * An AI-powered assistant that provides suggestions and facts about the user's plants.
 */
function GardenPal({ plants }) {

  // Helper function to calculate the age of a plant in days
  const getPlantAge = (datePlanted) => {
    const planted = new Date(datePlanted);
    const now = new Date();
    const diffTime = Math.abs(now - planted);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const generateNotices = (plant) => {
    const notices = [];
    const age = getPlantAge(plant.datePlanted);

    // Generic Notice based on age
    notices.push(`Your ${plant.name} was planted ${age} days ago.`);

    // AI-Powered Suggestion for a specific plant
    if (plant.name.toLowerCase().includes('basil')) {
      notices.push("Once a young Thai basil plant has six to eight sets of leaves, pinch off the top set of leaves to encourage branching and fuller growth.");
    }
    
    // Add more rules here for other plants or statuses!
    // Example for fruiting plants:
    if (plant.status === 'Fruiting') {
      notices.push(`Since this plant is fruiting, ensure it gets consistent water and consider a fertilizer rich in potassium.`);
    }

    return notices;
  };

  const activePlants = plants.filter(p => !p.isRemoved);

  return (
    <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }}}>
      <List>
        {activePlants.map((plant, index) => {
          const notices = generateNotices(plant);
          return (
            <React.Fragment key={plant.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <TipsAndUpdatesIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="h6">{plant.name} in "{plant.plotName || 'your garden'}"</Typography>}
                  secondaryTypographyProps={{ component: 'div' }} 
                  secondary={
                    <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                      {notices.map((notice, i) => (
                        <Typography component="li" variant="body2" key={i}>{notice}</Typography>
                      ))}
                    </Box>
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