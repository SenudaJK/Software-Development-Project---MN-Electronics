import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Drawer, Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#1e293b', // Dark blue-gray background
          color: '#ffffff', // White text
        },
      }}
    >
      {/* Sidebar Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 64,
          backgroundColor: '#0f172a', // Darker blue-gray for the header
          color: '#ffffff',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          MN Electronics
        </Typography>
      </Box>

      {/* Sidebar Menu */}
      <List>
        {/* Dashboard */}
        <ListItem button component={Link} to="/dashboard" sx={{ '&:hover': { backgroundColor: '#334155' } }}>
          <ListItemIcon sx={{ color: '#ffffff' }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>

        {/* Employee Section */}
        <ListItem button component={Link} to="/employees" sx={{ '&:hover': { backgroundColor: '#334155' } }}>
          <ListItemIcon sx={{ color: '#ffffff' }}>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="View Employee Details" />
        </ListItem>

        {/* Register Job */}
        <ListItem button component={Link} to="/register-job" sx={{ '&:hover': { backgroundColor: '#334155' } }}>
          <ListItemIcon sx={{ color: '#ffffff' }}>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText primary="Register Job And Customer" />
        </ListItem>

        {/* Customer Section */}
        <ListItem button component={Link} to="/customers" sx={{ '&:hover': { backgroundColor: '#334155' } }}>
          <ListItemIcon sx={{ color: '#ffffff' }}>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="View Customers" />
        </ListItem>
        <ListItem button component={Link} to="/create-account-customer" sx={{ '&:hover': { backgroundColor: '#334155' } }}>
          <ListItemIcon sx={{ color: '#ffffff' }}>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Register Customer" />
        </ListItem>

        {/* Job Section */}
        <ListItem button component={Link} to="/jobs" sx={{ '&:hover': { backgroundColor: '#334155' } }}>
          <ListItemIcon sx={{ color: '#ffffff' }}>
            <WorkIcon />
          </ListItemIcon>
          <ListItemText primary="View Jobs" />
        </ListItem>
        <ListItem button component={Link} to="/myjobs" sx={{ '&:hover': { backgroundColor: '#334155' } }}>
          <ListItemIcon sx={{ color: '#ffffff' }}>
            <WorkIcon />
          </ListItemIcon>
          <ListItemText primary="My Jobs" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;