import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
} from '@mui/material';

const CustomerRegistrationForm = () => {
  const [customer, setCustomer] = useState({
    customerId: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumbers: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Customer Data:', customer);
    // Add your form submission logic here
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
      <Container maxWidth="md" sx={{ mt: 10, mb: 4 }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          {/* Title */}
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
            Create an Account for Customer Registered by an Admin
          </Typography>

          {/* Customer Information Section */}
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
            Customer Information
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {/* Customer ID */}
            <TextField
              label="Enter Your Customer ID"
              name="customerId"
              value={customer.customerId}
              onChange={handleChange}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            />

            {/* Email */}
            <TextField
              label="Enter Your Email"
              name="email"
              value={customer.email}
              onChange={handleChange}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            />

            {/* First Name and Last Name */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="First Name"
                name="firstName"
                value={customer.firstName}
                onChange={handleChange}
                fullWidth
                size="small"
              />
              <TextField
                label="Last Name"
                name="lastName"
                value={customer.lastName}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Box>

            {/* Telephone Number */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <TextField
                label="Telephone number"
                name="phoneNumbers"
                value={customer.phoneNumbers}
                onChange={handleChange}
                fullWidth
                size="small"
              />
              <Button
                variant="contained"
                sx={{
                  bgcolor: 'black',
                  color: 'white',
                  '&:hover': { bgcolor: '#333' },
                  height: '40px',
                }}
              >
                Add
              </Button>
            </Box>

            {/* Username */}
            <TextField
              label="Username"
              name="username"
              value={customer.username}
              onChange={handleChange}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            />

            {/* Password */}
            <TextField
              label="Password"
              name="password"
              type="password"
              value={customer.password}
              onChange={handleChange}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            />

            {/* Confirm Password */}
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={customer.confirmPassword}
              onChange={handleChange}
              fullWidth
              size="small"
              sx={{ mb: 4 }}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{ py: 1.5 }}
                onClick={() => console.log('Cancel clicked')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  py: 1.5,
                  bgcolor: 'black',
                  '&:hover': {
                    bgcolor: '#333',
                  },
                }}
              >
                Register
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CustomerRegistrationForm;