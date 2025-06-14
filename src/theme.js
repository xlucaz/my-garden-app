// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    // Set the mode to 'light' for a brighter background
    mode: 'light',
    primary: {
      // We'll keep the same deep, saturated teal
      main: '#00796B',
    },
    secondary: {
      // And the same vibrant orchid purple for accents
      main: '#BA68C8',
    },
    background: {
      // A very light, soft cyan for the main background, reminiscent of a bright sky
      default: '#E0F2F1',
      // Plain white for cards and paper elements for clean contrast
      paper: '#FFFFFF',
    },
    success: {
        main: '#2E7D32',
    },
    info: {
        main: '#0288D1',
    },
    // In light mode, the default text is already dark, so we don't need to override it.
    text: {
        primary: 'rgba(0, 0, 0, 0.87)',
        secondary: 'rgba(0, 0, 0, 0.6)',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    // We can remove the color overrides, as MUI will use dark text on a light background by default
    h4: {
        fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    // Update component overrides to suit the light theme
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
            // A tooltip with a standard light background
            backgroundColor: '#FFFFFF',
            color: 'rgba(0, 0, 0, 0.87)',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.1)'
        }
      }
    },
    MuiAccordion: {
        styleOverrides: {
            root: {
                // Use a slightly off-white for accordions to distinguish them
                backgroundColor: '#F5F5F5',
            }
        }
    },
  }
});

export default theme;