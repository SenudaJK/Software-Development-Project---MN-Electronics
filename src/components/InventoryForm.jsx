import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

const InventoryForm = () => {
  const [formData, setFormData] = useState({
    product_name: '',
    stock_limit: ''
  });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/inventory/addInventory', formData);
      setMessage(response.data.message);
      setErrors({});
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors.reduce((acc, err) => ({ ...acc, [err.param]: err.msg }), {}));
      } else {
        setMessage(error.response ? error.response.data.message : error.message);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Add Inventory Item
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Product Name"
          name="product_name"
          value={formData.product_name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!errors.product_name}
          helperText={errors.product_name}
        />
        <TextField
          label="Stock Limit"
          name="stock_limit"
          type="number"
          value={formData.stock_limit}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!errors.stock_limit}
          helperText={errors.stock_limit}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Add Inventory
        </Button>
      </Box>
      {message && <Typography color="error">{message}</Typography>}
    </Container>
  );
};

export default InventoryForm;