import React from 'react';
import { Box, Typography } from '@mui/material';
import GardenDashboard from './GardenDashboard';
import GardenPal from './GardenPal';

/**
 * Main component for the GardenAI tab, combining the dashboard and the AI assistant.
 * @param {object} props
 * @param {Array} props.plants - The array of all plant objects.
 * @param {Array} props.plots - The array of all plot objects.
 * @param {object} props.aiTips - The object containing fetched AI tips.
 */
function GardenAI({ plants, plots, aiTips }) {
  return (
    <Box>
      <GardenDashboard plants={plants} plots={plots} />

      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Your Garden Pal
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Personalized tips and notices for your garden, powered by AI.
      </Typography>

      <GardenPal plants={plants} plots={plots} aiTips={aiTips} />
    </Box>
  );
}

export default GardenAI;