import React, { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";

const JobUsedInventory = () => {
  const { jobId } = useParams(); // Get the job ID from the URL
  const [inventoryItems, setInventoryItems] = useState([]); // List of inventory items
  const [selectedInventoryId, setSelectedInventoryId] = useState(""); // Selected inventory item
  const [batches, setBatches] = useState([]); // List of batches for the selected inventory item
  const [selectedBatchNo, setSelectedBatchNo] = useState(""); // Selected batch number
  const [quantityUsed, setQuantityUsed] = useState(""); // Quantity used
  const [searchTerm, setSearchTerm] = useState(""); // Search term for inventory items
  const [message, setMessage] = useState("");

  // Fetch inventory items from the backend
  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/inventory/getInventory");
        setInventoryItems(response.data);
      } catch (error) {
        console.error("Error fetching inventory items:", error);
      }
    };

    fetchInventoryItems();
  }, []);

  // Fetch batches for the selected inventory item
  useEffect(() => {
    if (selectedInventoryId) {
      const fetchBatches = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/inventoryBatch/getBatches/${selectedInventoryId}`
          );
          setBatches(response.data);
        } catch (error) {
          console.error("Error fetching batches:", error);
        }
      };

      fetchBatches();
    }
  }, [selectedInventoryId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedInventoryId || !selectedBatchNo || !quantityUsed) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/jobUsedInventory/add/${jobId}/${selectedInventoryId}/${selectedBatchNo}`,
        {
          Quantity_Used: quantityUsed,
        }
      );

      setMessage(response.data.message);
      setSelectedInventoryId("");
      setSelectedBatchNo("");
      setQuantityUsed("");
    } catch (error) {
      console.error("Error adding used inventory:", error);
      setMessage("Failed to add used inventory.");
    }
  };

  // Filter inventory items based on the search term
  const filteredInventoryItems = inventoryItems.filter((item) =>
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      sx={{
        backgroundColor: "#f8f9fa", // Light gray background
        minHeight: "100vh",
        padding: 4,
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "medium", marginBottom: 4 }}>
          Update Used Inventory for Job #{jobId}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Search Inventory Items */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Search Inventory Items"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
              />
            </Grid>

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
                  {filteredInventoryItems.map((item) => (
                    <MenuItem key={item.Inventory_ID} value={item.Inventory_ID}>
                      {item.product_name} (ID: {item.Inventory_ID})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Select Batch Number */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="batch-number-label">Select Batch Number</InputLabel>
                <Select
                  labelId="batch-number-label"
                  value={selectedBatchNo}
                  onChange={(e) => setSelectedBatchNo(e.target.value)}
                  label="Select Batch Number"
                >
                  {batches.map((batch) => (
                    <MenuItem key={batch.Batch_No} value={batch.Batch_No}>
                      Batch #{batch.Batch_No} - Quantity: {batch.Quantity}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Quantity Used */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity Used"
                type="number"
                value={quantityUsed}
                onChange={(e) => setQuantityUsed(e.target.value)}
                variant="outlined"
                required
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  "&:hover": { backgroundColor: "#333333" },
                }}
              >
                Update Inventory
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

export default JobUsedInventory;