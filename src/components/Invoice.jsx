import React from 'react';
import { Container, TextField, Typography, Box, Button, Grid } from '@mui/material';

const Invoice = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#f8f9fa', // Light gray background
        minHeight: '100vh',
        padding: 4,
      }}
    >
      {/* Header
      <Box
        sx={{
          backgroundColor: '#000000', // Black header
          color: '#ffffff',
          padding: 2,
          marginBottom: 4,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          MN Electronics
        </Typography>
      </Box> */}

      {/* Main Content */}
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'medium', marginBottom: 4 }}>
          Invoice for Advance Payment
        </Typography>

        <Grid container spacing={3}>
          {/* Job Details Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Job Details
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Job ID"
              variant="outlined"
              InputProps={{
                endAdornment: <Button sx={{ color: '#000000' }}>🔍</Button>, // Search icon
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Product Name" variant="outlined" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Model Number" variant="outlined" />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Repair Description"
              variant="outlined"
              multiline
              rows={3}
            />
          </Grid>

          {/* Customer Information Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Customer ID" variant="outlined" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Customer Name" variant="outlined" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Email" variant="outlined" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Telephone Number" variant="outlined" />
          </Grid>

          {/* Billing Information Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Billing Information
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Advance Amount" variant="outlined" />
          </Grid>

          {/* Buttons */}
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                backgroundColor: '#f8f9fa',
                color: '#000000',
                borderColor: '#000000',
                '&:hover': { backgroundColor: '#e0e0e0' },
              }}
            >
              Cancel
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: '#000000',
                color: '#ffffff',
                '&:hover': { backgroundColor: '#333333' },
              }}
            >
              Save Invoice
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Invoice;