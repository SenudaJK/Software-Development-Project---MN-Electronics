import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Paper, 
  Avatar, 
  IconButton, 
  InputBase, 
  Badge, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Card, 
  CardContent, 
  CardHeader, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  TextField, 
  Select, 
  MenuItem, 
  Button,
  LinearProgress
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  FolderOpen as ProjectsIcon, 
  CalendarToday as CalendarIcon, 
  Description as LeaveIcon, 
  Settings as SettingsIcon, 
  Notifications as NotificationsIcon, 
  Help as HelpIcon, 
  TrendingUp as PerformanceIcon, 
  AttachMoney as PayrollsIcon, 
  Receipt as InvoicesIcon, 
  People as EmployeesIcon, 
  PersonAdd as RecruitmentIcon, 
  KeyboardArrowDown as ExpandMoreIcon, 
  Search as SearchIcon, 
  MailOutline as MailIcon, 
  Refresh as RefreshIcon, 
  CloudDownload as ExportIcon, 
  FilterList as FilterIcon, 
  MoreVert as MoreIcon, 
  Visibility as VisibilityIcon, 
  ExpandMore as ExpandMoreIconSmall
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Custom styles
const SidebarWrapper = styled(Box)(({ theme }) => ({
  width: 250,
  backgroundColor: '#fff',
  borderRight: '1px solid #eaeaea',
  height: '100vh',
  padding: theme.spacing(2),
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  backgroundColor: '#f5f5f7',
  minHeight: '100vh',
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  borderRadius: '10px',
}));

const GaugeChart = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  background: `conic-gradient(
    #6366f1 0% ${props => props.value}%,
    #e5e5e5 ${props => props.value}% 100%
  )`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#fff',
  },
}));

const GaugeValue = styled(Typography)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  fontWeight: 'bold',
  fontSize: '1.5rem',
}));

const CircularProgressBar = ({ value, maxValue, color }) => {
  const percentage = (value / maxValue) * 100;
  return (
    <Box sx={{ position: 'relative', width: 80, height: 80 }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `conic-gradient(
            ${color} 0% ${percentage}%,
            #e5e5e5 ${percentage}% 100%
          )`,
          transform: 'rotate(-90deg)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '80%',
          height: '80%',
          borderRadius: '50%',
          backgroundColor: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

const PerformanceBar = ({ completed, presence, meeting }) => {
  return (
    <Box sx={{ width: '100%', mb: 1 }}>
      <Box sx={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{ backgroundColor: '#9c27b0', width: `${completed}%` }} />
        <Box sx={{ backgroundColor: '#2196f3', width: `${presence}%` }} />
        <Box sx={{ backgroundColor: '#4caf50', width: `${meeting}%` }} />
      </Box>
    </Box>
  );
};

const BarChart = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.income + item.expense));
  
  return (
    <Box sx={{ display: 'flex', height: 150, alignItems: 'flex-end', gap: 2 }}>
      {data.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ width: '60%', height: (item.expense / maxValue) * 130, backgroundColor: '#e3f2fd', position: 'relative', mb: 0.5 }}>
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', background: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #bbdefb 5px, #bbdefb 10px)' }} />
            </Box>
            <Box sx={{ width: '60%', height: (item.income / maxValue) * 130, backgroundColor: '#673ab7' }} />
          </Box>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
            {item.month}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const TurHRDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [roleFilter, setRoleFilter] = useState('All Role');

  // Sample data
  const employees = [
    { id: 'TUR871219', name: 'Ahsan Tapader', email: 'ahsan.tur@mail.com', role: 'Sr UI/UX Designer', department: 'Team Projects', status: 'Full-time', avatar: 'https://i.pravatar.cc/300?img=1' },
    { id: 'TUR185103', name: 'Washi Bin M.', email: 'washi.tur@mail.com', role: 'Lead Product Designer', department: 'Head of Projects', status: 'Full-time', avatar: 'https://i.pravatar.cc/300?img=2' },
    { id: 'TUR715481', name: 'Koyes Ahmed', email: 'koyes.tur@mail.com', role: 'Sr UX Designer', department: 'Client & Team Work', status: 'Full-time', avatar: 'https://i.pravatar.cc/300?img=3' },
    { id: 'TUR016481', name: 'Turja Sen Das', email: 'Turja.tur@mail.com', role: 'Mid UI Designer', department: 'Case Study', status: 'Freelance', avatar: 'https://i.pravatar.cc/300?img=4' },
  ];

  const performanceData = [
    { name: 'Ahsan Tapader', completed: 15, presence: 15, meeting: 10 },
    { name: 'Koyes Ahmed', completed: 10, presence: 15, meeting: 15 },
    { name: 'Washi Bin M.', completed: 25, presence: 10, meeting: 10 },
    { name: 'Mir Muhsin', completed: 12, presence: 13, meeting: 15 },
    { name: 'Turja Sen Das', completed: 25, presence: 10, meeting: 5 },
  ];

  const incomeStats = [
    { month: 'Jan', income: 1000, expense: 500 },
    { month: 'Feb', income: 1200, expense: 600 },
    { month: 'Mar', income: 1100, expense: 550 },
    { month: 'Apr', income: 1300, expense: 650 },
    { month: 'May', income: 2000, expense: 750 },
    { month: 'Jun', income: 1400, expense: 700 },
    { month: 'Jul', income: 1500, expense: 750 },
    { month: 'Aug', income: 1600, expense: 800 },
    { month: 'Sep', income: 1700, expense: 850 },
    { month: 'Oct', income: 1800, expense: 900 },
    { month: 'Nov', income: 1900, expense: 950 },
    { month: 'Dec', income: 1200, expense: 600 },
  ];

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f5f5f7' }}>
      {/* Sidebar */}
      <SidebarWrapper>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ bgcolor: '#6366f1', width: 32, height: 32, fontSize: '1rem' }}>Tu</Avatar>
          <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>TurHR</Typography>
        </Box>

        <List>
          <ListItem button selected sx={{ borderRadius: 1, mb: 0.5 }}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button sx={{ borderRadius: 1, mb: 0.5 }}>
            <ListItemIcon><ProjectsIcon /></ListItemIcon>
            <ListItemText primary="Projects" />
          </ListItem>
          <ListItem button sx={{ borderRadius: 1, mb: 0.5 }}>
            <ListItemIcon><CalendarIcon /></ListItemIcon>
            <ListItemText primary="Calendar" />
          </ListItem>
          <ListItem button sx={{ borderRadius: 1, mb: 0.5 }}>
            <ListItemIcon><LeaveIcon /></ListItemIcon>
            <ListItemText primary="Leave Management" />
          </ListItem>
          <ListItem button sx={{ borderRadius: 1, mb: 0.5 }}>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
          <ListItem button sx={{ borderRadius: 1, mb: 0.5 }}>
            <ListItemIcon><NotificationsIcon /></ListItemIcon>
            <ListItemText primary="Notification" />
          </ListItem>
          <ListItem button sx={{ borderRadius: 1, mb: 0.5 }}>
            <ListItemIcon><HelpIcon /></ListItemIcon>
            <ListItemText primary="Help & Center" />
          </ListItem>
        </List>

        <Typography variant="caption" color="textSecondary" sx={{ mt: 3, mb: 1, display: 'block' }}>
          TEAM MANAGEMENT
        </Typography>

        <List>
          <ListItem button sx={{ borderRadius: 1, mb: 0.5 }}>
            <ListItemIcon><PerformanceIcon /></ListItemIcon>
            <ListItemText primary="Performance" />
          </ListItem>
          <ListItem button sx={{ borderRadius: 1, mb: 0.5 }}>
            <ListItemIcon><PayrollsIcon /></ListItemIcon>
            <ListItemText primary="Payrolls" />
          </ListItem>
          <ListItem button sx={{ borderRadius: 1, mb: 0.5 }}>
            <ListItemIcon><InvoicesIcon /></ListItemIcon>
            <ListItemText primary="Invoices" />
          </ListItem>
          <ListItem button sx={{ borderRadius: 1, mb: 0.5 }}>
            <ListItemIcon><EmployeesIcon /></ListItemIcon>
            <ListItemText primary="Employees" />
          </ListItem>
          <ListItem button sx={{ borderRadius: 1, mb: 0.5 }}>
            <ListItemIcon><RecruitmentIcon /></ListItemIcon>
            <ListItemText primary="Recruitment & Hiring" />
          </ListItem>
        </List>

        <Typography variant="caption" color="textSecondary" sx={{ mt: 3, mb: 1, display: 'block', display: 'flex', alignItems: 'center' }}>
          LIST <ExpandMoreIcon sx={{ ml: 1, fontSize: '1rem' }} />
        </Typography>

        <List>
          <ListItem button sx={{ borderRadius: 1, mb: 0.5 }}>
            <ListItemIcon>
              <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRadius: '50%' }}>
                <AttachMoney sx={{ fontSize: '1rem', color: '#6366f1' }} />
              </Box>
            </ListItemIcon>
            <ListItemText primary="Salary Information" />
          </ListItem>
          <ListItem button sx={{ borderRadius: 1, mb: 0.5 }}>
            <ListItemIcon>
              <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRadius: '50%' }}>
                <PerformanceIcon sx={{ fontSize: '1rem', color: '#6366f1' }} />
              </Box>
            </ListItemIcon>
            <ListItemText primary="Compensation Breakdown" />
          </ListItem>
          <ListItem button sx={{ borderRadius: 1, mb: 0.5 }}>
            <ListItemIcon>
              <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRadius: '50%' }}>
                <Description sx={{ fontSize: '1rem', color: '#6366f1' }} />
              </Box>
            </ListItemIcon>
            <ListItemText primary="Project-specific Data" />
          </ListItem>
        </List>

        <Box sx={{ mt: 4, p: 2, bgcolor: '#f3f4f6', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
              Notifications
            </Typography>
            <IconButton>
              <MoreIcon />
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ mt: 2 }}>
            <List>
              <ListItem button>
                <ListItemIcon>
                  <MailIcon />
                </ListItemIcon>
                <ListItemText primary="You have 5 new messages" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText primary="3 new notifications" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <HelpIcon />
                </ListItemIcon>
                <ListItemText primary="2 new help requests" />
              </ListItem>
            </List>
          </Box>
        </Box>
      </SidebarWrapper>

      {/* Main Content */}
      <MainContent>
        <Container>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <StatsCard>
                <CardHeader title="Income vs Expense" />
                <CardContent>
                  <BarChart data={incomeStats} />
                </CardContent>
              </StatsCard>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <StatsCard>
                <CardHeader title="Performance" />
                <CardContent>
                  {performanceData.map((data, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {data.name}
                      </Typography>
                      <PerformanceBar completed={data.completed} presence={data.presence} meeting={data.meeting} />
                    </Box>
                  ))}
                </CardContent>
              </StatsCard>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <StatsCard>
                <CardHeader title="Gauge Chart" />
                <CardContent>
                  <GaugeChart value={75} />
                  <GaugeValue>75%</GaugeValue>
                </CardContent>
              </StatsCard>
            </Grid>
          </Grid>
        </Container>
      </MainContent>
    </Box>
  );
};

export default TurHRDashboard;