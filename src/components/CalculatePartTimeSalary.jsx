import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const CalculatePartTimeSalary = () => {
  const [employeeDetails, setEmployeeDetails] = useState({
    employeeName: '',
    employeeId: '',
    email: '',
  });

  const [jobDetails, setJobDetails] = useState({
    jobId: '',
    productName: '',
    repairDescription: '',
    totalAmount: '',
    employeeAmount: '',
  });

  const handleEmployeeSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/employees/${employeeDetails.employeeName}`);
      const { employeeId, email } = response.data;
      setEmployeeDetails((prev) => ({
        ...prev,
        employeeId,
        email,
      }));
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  const handleJobSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/jobs/${jobDetails.jobId}`);
      const { productName, repairDescription } = response.data;
      setJobDetails((prev) => ({
        ...prev,
        productName,
        repairDescription,
      }));
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  const handleTotalAmountChange = async (e) => {
    const totalAmount = e.target.value;
    setJobDetails((prev) => ({
      ...prev,
      totalAmount,
    }));

    try {
      const response = await axios.post(
        `http://localhost:5000/api/calculatePartTimeSalary/${employeeDetails.employeeId}`,
        { totalAmount }
      );
      const { employeeAmount } = response.data;
      setJobDetails((prev) => ({
        ...prev,
        employeeAmount,
      }));
    } catch (error) {
      console.error('Error calculating employee amount:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Employee Details:', employeeDetails);
    console.log('Job Details:', jobDetails);
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
            Calculate Part time Salary
          </Typography>

          {/* Employee Details Section */}
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
            Employee Details
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {/* Employee Name */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                label="Employee Name"
                name="employeeName"
                value={employeeDetails.employeeName}
                onChange={(e) =>
                  setEmployeeDetails((prev) => ({
                    ...prev,
                    employeeName: e.target.value,
                  }))
                }
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon
                        onClick={handleEmployeeSearch}
                        style={{ cursor: 'pointer' }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Employee ID */}
            <TextField
              label="Employee ID"
              name="employeeId"
              value={employeeDetails.employeeId}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              disabled
            />

            {/* Email */}
            <TextField
              label="Email"
              name="email"
              value={employeeDetails.email}
              fullWidth
              size="small"
              sx={{ mb: 4 }}
              disabled
            />

            {/* Job Details Section */}
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
              Job Details
            </Typography>

            {/* Job ID and Product Name */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Job ID"
                name="jobId"
                value={jobDetails.jobId}
                onChange={(e) =>
                  setJobDetails((prev) => ({
                    ...prev,
                    jobId: e.target.value,
                  }))
                }
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon
                        onClick={handleJobSearch}
                        style={{ cursor: 'pointer' }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Product Name"
                name="productName"
                value={jobDetails.productName}
                fullWidth
                size="small"
                disabled
              />
            </Box>

            {/* Repair Description */}
            <TextField
              label="Repair Description"
              name="repairDescription"
              value={jobDetails.repairDescription}
              fullWidth
              multiline
              rows={3}
              size="small"
              sx={{ mb: 4 }}
              disabled
            />

            {/* Total Amount and Employee Amount */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <TextField
                label="Total Amount"
                name="totalAmount"
                value={jobDetails.totalAmount}
                onChange={handleTotalAmountChange}
                fullWidth
                size="small"
              />
              <TextField
                label="Employee Amount"
                name="employeeAmount"
                value={jobDetails.employeeAmount}
                fullWidth
                size="small"
                disabled
              />
            </Box>

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
                Calculate
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CalculatePartTimeSalary;