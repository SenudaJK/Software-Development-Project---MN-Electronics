import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import backgroundImage from '../assets/login-bg.jpg'; // Import the background image

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const response = await axios.get('http://localhost:5000/api/csrf-token');
      setCsrfToken(response.data.csrfToken);
    };
    fetchCsrfToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Client-side validation
    if (!email || !password) {
      setMessage("Email and password are required");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/api/employees/login", { email, password });
  
      console.log("Backend Response:", response.data); // Debugging
  
      if (response.data.success) {
        const { employeeId } = response.data; // Extract employeeId from the response
        console.log("Extracted Employee ID:", employeeId); // Debugging
        onLogin(employeeId); // Pass the employeeId to App.jsx
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error during login:", error); // Debugging
      setMessage(error.response?.data?.message || "Error logging in");
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'DM Sans, sans-serif',
        backgroundImage: `url(${backgroundImage})`, // Set the background image
        backgroundSize: 'cover', // Ensure the image covers the entire container
        backgroundPosition: 'center', // Center the image
        backgroundRepeat: 'no-repeat', // Prevent the image from repeating
      }}
    >
      <Container
        maxWidth="xs"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 3,
          border: '1px solid #ccc',
          borderRadius: 2,
          boxShadow: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white background
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        <Typography component="h1" variant="h5" sx={{ fontFamily: 'DM Sans, sans-serif', color: '#333' }}>
          Employee Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ fontFamily: 'DM Sans, sans-serif' }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ fontFamily: 'DM Sans, sans-serif' }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, fontFamily: 'DM Sans, sans-serif', backgroundColor: '#1976d2', color: '#fff' }}
          >
            Login
          </Button>
        </Box>
        {message && <Typography color="error" sx={{ fontFamily: 'DM Sans, sans-serif' }}>{message}</Typography>}
      </Container>
    </Box>
  );
};

export default Login;