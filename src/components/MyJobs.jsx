import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import axios from 'axios';

const MyJobs = ({ employeeId }) => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // Fetch jobs assigned to the logged-in technician
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/jobs?employeeId=${employeeId}`);
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, [employeeId]);

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
      <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
          My Jobs
        </Typography>

        {/* Jobs Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job ID</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Repair Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Handover Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.length > 0 ? (
                jobs.map((job, index) => (
                  <TableRow key={index}>
                    <TableCell>{job.jobId}</TableCell>
                    <TableCell>{job.productName}</TableCell>
                    <TableCell>{job.repairDescription}</TableCell>
                    <TableCell>{job.status}</TableCell>
                    <TableCell>{job.handoverDate}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          bgcolor: 'black',
                          color: 'white',
                          '&:hover': { bgcolor: '#333' },
                        }}
                      >
                        Update Status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No jobs assigned
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default MyJobs;