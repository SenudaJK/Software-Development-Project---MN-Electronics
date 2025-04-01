import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import moment from 'moment';

const EmployeeDetail = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/employees/${id}`);
        setEmployee(response.data);
      } catch (error) {
        console.error('Error fetching employee:', error);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const updatedEmployee = {
      ...employee,
      dateOfBirth: moment(employee.dateOfBirth).format('YYYY-MM-DD') // Format the date
    };
    console.log('Updating employee:', updatedEmployee); // Log the employee data
    try {
      const response = await axios.put(`http://localhost:5000/api/employees/${id}`, updatedEmployee);
      console.log('Server response:', response.data); // Log the server response
      setMessage('Employee updated successfully');
      navigate('/employees');
    } catch (error) {
      setMessage('Error updating employee');
      console.error('Error updating employee:', error);
      if (error.response) {
        console.error('Server response:', error.response.data); // Log the server response error
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumbers") {
      setEmployee((prev) => ({
        ...prev,
        phone_number: value.split(",").map((num) => num.trim()), // Convert to array
      }));
    } else {
      setEmployee((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (!employee) return <div>Loading...</div>;

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Update Employee
      </Typography>
      <Box component="form" onSubmit={handleUpdate}>
        <TextField
          label="First Name"
          name="firstName"
          value={employee.firstName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Last Name"
          name="lastName"
          value={employee.lastName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={moment(employee.dateOfBirth).format('YYYY-MM-DD')}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="NIC"
          name="nic"
          value={employee.nic}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Role</InputLabel>
          <Select
            label="Role"
            name="role"
            value={employee.role}
            onChange={handleChange}
          >
            <MenuItem value="owner">Owner</MenuItem>
            <MenuItem value="technician">Technician</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Email"
          name="email"
          value={employee.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Telephone Number"
          name="phoneNumbers"
          value={employee.phoneNumbers}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Update
        </Button>
      </Box>
      {message && <Typography color="error">{message}</Typography>}
    </Container>
  );
};

export default EmployeeDetail;