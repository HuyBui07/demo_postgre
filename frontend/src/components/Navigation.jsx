import { NavLink } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemText, ListItemIcon, Divider, Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import ListAltIcon from '@mui/icons-material/ListAlt';
import HomeIcon from '@mui/icons-material/Home';

const navItems = [
  { text: 'All Todos', path: '/', icon: <HomeIcon /> },
  { text: 'Manage Lists', path: '/lists', icon: <ListAltIcon /> },
];

function Navigation() {
  return (
    <Box sx={{ width: 250, height: '100vh', borderRight: '1px solid #eee', bgcolor: 'background.paper' }}>
      <List>
        <ListItem sx={{ justifyContent: 'center', py: 2 }}>
          <Typography variant="h6" component="div">
            Todo App
          </Typography>
        </ListItem>
        <Divider />
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              end // Use 'end' for the root path to avoid matching all sub-paths
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
              })}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default Navigation;