import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  MenuItem,
  Select,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const ViewInventory = () => {
  const [tabValue, setTabValue] = useState(0);
  const [sortBy, setSortBy] = useState('Date');
  const [inventoryData, setInventoryData] = useState([]); // Replace with fetched data

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Fetch inventory data based on the selected tab (e.g., IC, Motors, Panels)
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    // Sort inventory data based on the selected value
  };

  return (
    <Box>
      {/* Fixed Header Section */}
      <Box
        sx={{
          bgcolor: 'black',
          color: 'white',
          p: 2,
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1000,
        }}
      >
        <Typography variant="h6" sx={{ textAlign: 'left', ml: 2 }}>
          MN Electronics
        </Typography>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
          View Inventory
        </Typography>

        {/* Tabs for Inventory Categories */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="primary"
          sx={{ mb: 3 }}
        >
          <Tab label="IC" />
          <Tab label="Motors" />
          <Tab label="Panels" />
        </Tabs>

        {/* Search and Sort Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          {/* Search Bar */}
          <TextField
            placeholder="Search in Inventory"
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: '50%' }}
          />

          {/* Sort Dropdown */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">Sort By</Typography>
            <Select
              value={sortBy}
              onChange={handleSortChange}
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="Date">Date</MenuItem>
              <MenuItem value="Quantity">Quantity</MenuItem>
              <MenuItem value="Cost">Cost</MenuItem>
            </Select>
          </Box>
        </Box>

        {/* Inventory Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Inventory ID</TableCell>
                <TableCell>Batch No</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell>Cost Per Item</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Date Added</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventoryData.length > 0 ? (
                inventoryData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.inventoryId}</TableCell>
                    <TableCell>{item.batchNo}</TableCell>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell>{item.costPerItem}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.totalAmount}</TableCell>
                    <TableCell>{item.dateAdded}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'black',
              color: 'white',
              '&:hover': { bgcolor: '#333' },
            }}
          >
            Add New Purchase
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'blue',
              color: 'white',
              '&:hover': { bgcolor: '#003366' },
            }}
          >
            Update
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ViewInventory;