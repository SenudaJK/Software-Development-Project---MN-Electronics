import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  RadioGroup,
  Radio,
  FormControlLabel,
  Paper,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axios from 'axios';

const EmployeeRegistrationForm = () => {
  const [employee, setEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumbers: '',
    nic: '',
    dateOfBirth: '',
    role: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (employee.password !== employee.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      // Prepare phone numbers as an array
      const phoneNumbersArray = employee.phoneNumbers
        .split(',')
        .map((phone) => phone.trim());

      // Send data to the backend
      const response = await axios.post('http://localhost:5000/api/employees/MN register', {
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        username: employee.username,
        password: employee.password,
        dateOfBirth: employee.dateOfBirth,
        role: employee.role,
        phoneNumbers: phoneNumbersArray,
        nic: employee.nic,
      });

      // Handle success
      setMessage(response.data.message);
      setErrors([]);
    } catch (error) {
      // Handle validation errors
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setMessage(error.response?.data?.message || 'An error occurred');
      }
    }
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
            Register an Employee
          </Typography>

          {/* Employee Information Section */}
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
            Employee Information
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {/* First Name and Last Name */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="First Name"
                name="firstName"
                value={employee.firstName}
                onChange={handleChange}
                fullWidth
                size="small"
              />
              <TextField
                label="Last Name"
                name="lastName"
                value={employee.lastName}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Box>

            {/* Email */}
            <TextField
              label="Email"
              name="email"
              value={employee.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              size="small"
              sx={{ mt: 1, mb: 2 }}
            />

            {/* Telephone Number */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <TextField
                label="Telephone number (comma-separated)"
                name="phoneNumbers"
                value={employee.phoneNumbers}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Box>

            {/* NIC Number */}
            <TextField
              label="NIC Number"
              name="nic"
              value={employee.nic}
              onChange={handleChange}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            />

            {/* Date of Birth */}
            <Box sx={{ position: 'relative', mb: 2 }}>
              <TextField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={employee.dateOfBirth}
                onChange={handleChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <CalendarTodayIcon
                sx={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'action.active',
                  pointerEvents: 'none',
                }}
              />
            </Box>

            {/* Role Selection */}
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'medium', textAlign: 'left' }}>
              Select Your Role
            </Typography>
            <RadioGroup
              name="role"
              value={employee.role}
              onChange={handleChange}
              sx={{ mb: 2 }}
            >
              <FormControlLabel value="owner" control={<Radio />} label="Owner" />
              <FormControlLabel value="technician" control={<Radio />} label="Technician" />
            </RadioGroup>

            {/* Username */}
            <TextField
              label="Username"
              name="username"
              value={employee.username}
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
              value={employee.password}
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
              value={employee.confirmPassword}
              onChange={handleChange}
              fullWidth
              size="small"
              sx={{ mb: 4 }}
            />

            {/* Display Errors */}
            {errors.length > 0 && (
              <Box sx={{ mb: 2 }}>
                {errors.map((error, index) => (
                  <Typography key={index} color="error" variant="body2">
                    {error.msg}
                  </Typography>
                ))}
              </Box>
            )}

            {/* Display Success Message */}
            {message && (
              <Typography color={errors.length > 0 ? 'error' : 'success'} sx={{ mb: 2 }}>
                {message}
              </Typography>
            )}

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

export default EmployeeRegistrationForm;