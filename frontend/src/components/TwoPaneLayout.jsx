import { Box } from '@mui/material';

export function TwoPaneLayout({
  leftPane,
  rightPane,
  leftWidth = '60%',
  rightWidth = '40%'
}) {
  return (
    <Box sx={{
      display: 'flex',
      width: '100%',
      height: '100%',
      boxSizing: 'border-box'
    }}>
      <Box sx={{
        width: leftWidth,
        height: '100%',
        overflowY: 'auto',
      }}>
        {leftPane}
      </Box>
      <Box sx={{
        width: rightWidth,
        height: '100%',
        overflowY: 'auto',
        borderLeft: '1px solid #eee',
      }}>
        {rightPane}
      </Box>
    </Box>
  );
}