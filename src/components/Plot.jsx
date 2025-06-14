import React from 'react';
import { Card, CardContent, Box, Typography, Tooltip } from '@mui/material';
import WateringTimer from './WateringTimer';

import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import GrassIcon from '@mui/icons-material/Grass';
import SpaIcon from '@mui/icons-material/Spa';
import YardIcon from '@mui/icons-material/Yard';

const getPlantIcon = (plantName) => {
  const name = plantName.toLowerCase();
  if (name.includes('tomato') || name.includes('pepper')) return <LocalFloristIcon fontSize="small" color="success" />;
  if (name.includes('cucumber') || name.includes('squash')) return <YardIcon fontSize="small" color="success" />;
  if (name.includes('herb') || name.includes('lettuce') || name.includes('basil')) return <GrassIcon fontSize="small" color="success" />;
  return <SpaIcon fontSize="small" color="success" />;
};


function Plot({ plot, plantsForPlot, onCardClick }) {
  return (
    <Card
      onClick={() => onCardClick(plot)}
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 0.5 }}>
          {plantsForPlot.length > 0 ? (
            plantsForPlot.slice(0, 3).map(plant => (
              <Tooltip key={plant.id} title={plant.name}>
                <span>{getPlantIcon(plant.name)}</span>
              </Tooltip>
            ))
          ) : (
            <Tooltip title="No plants">
              <span><SpaIcon fontSize="small" color="disabled" /></span>
            </Tooltip>
          )}
        </Box>

        <Typography variant="h5" component="div" sx={{ pr: '60px' }}>
          {plot.name}
        </Typography>
        <WateringTimer nextWateringTime={plot.nextWateringTime} wateringInterval={plot.wateringInterval} />
      </CardContent>
    </Card>
  );
}

export default Plot;