import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import SpaIcon from '@mui/icons-material/Spa';
import GrassIcon from '@mui/icons-material/Grass';
import YardIcon from '@mui/icons-material/Yard';

/**
 * A data-rich dashboard showing statistics about the garden.
 */
function GardenDashboard({ plants, plots }) {
  const totalPlants = plants.filter(p => !p.isRemoved).length;
  const totalPlots = plots.length;

  // Calculate the distribution of plants by their status
  const statusDistribution = plants.reduce((acc, plant) => {
    if (!plant.isRemoved && plant.status) {
      acc[plant.status] = (acc[plant.status] || 0) + 1;
    }
    return acc;
  }, {});

  const StatCard = ({ title, value, icon }) => (
    <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      {icon}
      <Box>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="h4">{value}</Typography>
      </Box>
    </Paper>
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard title="Total Plots" value={totalPlots} icon={<YardIcon color="primary" sx={{ fontSize: 40 }} />} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard title="Total Active Plants" value={totalPlants} icon={<SpaIcon color="secondary" sx={{ fontSize: 40 }} />} />
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 2 }}>
           <Typography variant="h6">Plant Status</Typography>
           <Box>
            {Object.entries(statusDistribution).map(([status, count]) => (
              <Typography key={status} variant="body1">
                {status}: <strong>{count}</strong>
              </Typography>
            ))}
           </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default GardenDashboard;