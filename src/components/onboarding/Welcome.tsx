import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import {
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  CalendarMonth as CalendarIcon,
  Insights as InsightsIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleGetStarted = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    navigate('/canvas-import');
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    navigate('/dashboard');
  };

  const features = [
    { icon: <CalendarIcon />, title: 'Unified Timeline', description: 'All assignments in one view' },
    { icon: <AutoAwesomeIcon />, title: 'AI Parsing', description: 'Extract tasks from syllabi automatically' },
    { icon: <ScheduleIcon />, title: 'Smart Scheduling', description: 'Optimize your study time' },
    { icon: <InsightsIcon />, title: '3D Visualization', description: 'See your workload clearly' },
    { icon: <TimerIcon />, title: 'Focus Timer', description: 'Track study sessions' },
    { icon: <CheckCircleIcon />, title: 'Task Management', description: 'Never miss a deadline' },
  ];

  const steps = [
    { number: '1', title: 'Import Courses', description: 'Connect to Canvas or add manually' },
    { number: '2', title: 'Load Syllabi', description: 'AI extracts all assignments automatically' },
    { number: '3', title: 'Get Organized', description: 'View everything in one unified timeline' },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Header with Logo */}
        <Box sx={{ textAlign: 'center', mb: 6, mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
            <img src="/logo.png" alt="Stuidora" style={{ height: 60 }} />
          </Box>
          <Typography variant="h3" fontWeight={600} color="text.primary" gutterBottom>
            Welcome to Stuidora
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Your intelligent academic assistant that brings order to the chaos of student life
          </Typography>
        </Box>

        {/* Problem Statement */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, backgroundColor: 'background.paper' }}>
          <Typography variant="h5" fontWeight={500} gutterBottom color="text.primary">
            The Challenge
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 1 }}>
            <Box sx={{ flex: '1 1 300px', textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                Course materials scattered across multiple platforms
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 300px', textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                Complex syllabi with buried deadlines
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 300px', textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                Difficulty managing time across courses
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* How It Works */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={500} gutterBottom color="text.primary" sx={{ mb: 3 }}>
            How Stuidora Works
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {steps.map((step, index) => (
              <Box key={index} sx={{ flex: '1 1 300px' }}>
                <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        mr: 2
                      }}>
                        {step.number}
                      </Box>
                      <Typography variant="h6" fontWeight={500}>
                        {step.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Features Grid */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, backgroundColor: 'background.paper' }}>
          <Typography variant="h5" fontWeight={500} gutterBottom color="text.primary">
            Key Features
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            {features.map((feature, index) => (
              <Box key={index} sx={{ flex: '1 1 250px', display: 'flex', alignItems: 'flex-start' }}>
                <Box sx={{ color: 'primary.main', mr: 2 }}>
                  {feature.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{ 
                px: 4,
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleSkip}
              sx={{ 
                px: 4,
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              Skip for Now
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Import your courses to begin organizing your academic life
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Welcome;