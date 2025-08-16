import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  CalendarMonth as CalendarIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  Upload as UploadIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useScheduleStore } from '../../stores/useScheduleStore';

const drawerWidth = 240;

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { courses, tasks } = useScheduleStore();
  const isEmpty = courses.length === 0 && tasks.length === 0;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Timeline', icon: <TimelineIcon />, path: '/timeline' },
    { text: 'Schedule', icon: <CalendarIcon />, path: '/schedule' },
    { text: 'Tasks', icon: <AssignmentIcon />, path: '/tasks' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      {/* Logo Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/logo.png" alt="Stuidora" style={{ height: 40 }} />
      </Box>
      
      <Divider />

      {/* Import Courses Button (if empty) */}
      {isEmpty && (
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => navigate('/canvas-import')}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              py: 1.5,
              background: theme.palette.primary.main,
              '&:hover': {
                background: theme.palette.primary.dark,
              }
            }}
          >
            Import Courses
          </Button>
        </Box>
      )}

      {/* Navigation Menu */}
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                },
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.main,
                },
                '& .MuiListItemText-primary': {
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                },
              },
              '&:hover': {
                backgroundColor: alpha(theme.palette.action.hover, 0.08),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: theme.palette.text.secondary }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: location.pathname === item.path ? 600 : 400,
              }}
            />
          </ListItemButton>
        ))}
      </List>

      {/* Course Stats */}
      {!isEmpty && (
        <Box sx={{ mt: 'auto', p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SchoolIcon sx={{ fontSize: 18, mr: 1, color: theme.palette.text.secondary }} />
            <Typography variant="caption" color="text.secondary">
              {courses.length} Course{courses.length !== 1 ? 's' : ''} Active
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AssignmentIcon sx={{ fontSize: 18, mr: 1, color: theme.palette.text.secondary }} />
            <Typography variant="caption" color="text.secondary">
              {tasks.filter(t => t.status !== 'completed').length} Tasks Pending
            </Typography>
          </Box>
        </Box>
      )}
    </Drawer>
  );
};

export default Navigation;