import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import axios from 'axios';

const InventoryBatchRegistration = () => {
  const [inventoryItems, setInventoryItems] = useState([]); // List of inventory items
  const [selectedInventoryId, setSelectedInventoryId] = useState(''); // Selected inventory item
  const [quantity, setQuantity] = useState('');
  const [costPerItem, setCostPerItem] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [message, setMessage] = useState('');

  // Fetch inventory items from the backend
  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/inventory/getInventory'); // Replace with your inventory endpoint
        setInventoryItems(response.data);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      }
    };

    fetchInventoryItems();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedInventoryId || !quantity || !costPerItem) {
      setMessage('Please fill in all required fields.');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/inventoryBatch/addBatch/${selectedInventoryId}`,
        {
          Quantity: quantity,
          Cost_Per_Item: costPerItem,
          Purchase_Date: purchaseDate || new Date().toISOString().split('T')[0], // Default to today's date
        }
      );

      setMessage(response.data.message);
      setQuantity('');
      setCostPerItem('');
      setPurchaseDate('');
      setSelectedInventoryId('');
    } catch (error) {
      console.error('Error adding inventory batch:', error);
      setMessage('Failed to add inventory batch.');
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#f8f9fa', // Light gray background
        minHeight: '100vh',
        padding: 4,
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'medium', marginBottom: 4 }}>
          Inventory Batch Registration
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Select Inventory Item */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="inventory-item-label">Select Inventory Item</InputLabel>
                <Select
                  labelId="inventory-item-label"
                  value={selectedInventoryId}
                  onChange={(e) => setSelectedInventoryId(e.target.value)}
                  label="Select Inventory Item"
                >
                  {inventoryItems.map((item) => (
                    <MenuItem key={item.Inventory_ID} value={item.Inventory_ID}>
                      {item.product_name} (ID: {item.Inventory_ID})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Quantity */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                variant="outlined"
                required
              />
            </Grid>

            {/* Cost Per Item */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost Per Item"
                type="number"
                value={costPerItem}
                onChange={(e) => setCostPerItem(e.target.value)}
                variant="outlined"
                required
              />
            </Grid>

            {/* Purchase Date */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Purchase Date"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  '&:hover': { backgroundColor: '#333333' },
                }}
              >
                Add Batch
              </Button>
            </Grid>

            {/* Message */}
            {message && (
              <Grid item xs={12}>
                <Typography color="primary" variant="body1">
                  {message}
                </Typography>
              </Grid>
            )}
          </Grid>
        </form>
      </Container>
    </Box>
  );
};

export default InventoryBatchRegistration;