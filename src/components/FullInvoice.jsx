import React from 'react';
import { Container, TextField, Typography, Box, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const FullInvoice = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#f8f9fa', // Light gray background
        minHeight: '100vh',
        padding: 4,
      }}
    >
      {/* Header */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'medium', marginBottom: 4 }}>
        Invoice
      </Typography>

      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Job Details Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Job Details
            </Typography>
            <TextField
              fullWidth
              label="Job ID"
              variant="outlined"
              InputProps={{
                endAdornment: <Button sx={{ color: '#000000' }}>🔍</Button>, // Search icon
              }}
              sx={{ marginBottom: 2 }}
            />
            <TextField fullWidth label="Product Name" variant="outlined" sx={{ marginBottom: 2 }} />
            <TextField fullWidth label="Model Number" variant="outlined" sx={{ marginBottom: 2 }} />
            <TextField
              fullWidth
              label="Repair Description"
              variant="outlined"
              multiline
              rows={3}
              sx={{ marginBottom: 2 }}
            />
          </Grid>

          {/* Used Inventory Items Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Used Inventory Items
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Example row */}
                  <TableRow>
                    <TableCell>Example Item</TableCell>
                    <TableCell>2</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Customer Information Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Customer ID" variant="outlined" sx={{ marginBottom: 2 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Customer Name" variant="outlined" sx={{ marginBottom: 2 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Email" variant="outlined" sx={{ marginBottom: 2 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Telephone Number" variant="outlined" sx={{ marginBottom: 2 }} />
          </Grid>

          {/* Billing Information Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Billing Information
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Total Cost For Parts Used" variant="outlined" sx={{ marginBottom: 2 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Labour Cost and Other Expenses" variant="outlined" sx={{ marginBottom: 2 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Advance Amount" variant="outlined" sx={{ marginBottom: 2 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Total Amount" variant="outlined" sx={{ marginBottom: 2 }} />
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
              Save Invoice as PDF
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default FullInvoice;