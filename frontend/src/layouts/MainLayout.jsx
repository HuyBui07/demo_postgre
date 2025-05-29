import { Box } from '@mui/material';
import Navigation from '../components/Navigation';

function MainLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Box component="nav" sx={{ width: 250, flexShrink: 0 }}>
        <Navigation />
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          overflowY: 'auto',
          bgcolor: '#f4f6f8',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default MainLayout;