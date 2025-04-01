import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import './JobTable.css'; // Import the CSS file

const JobTable = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/jobs/get');
        setJobs(response.data);
        setLoading(false);
      } catch (error) {
        setError('Error fetching jobs');
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container className="job-table-container">
      <Typography variant="h4" className="job-table-title">
        Job List
      </Typography>
      <TableContainer component={Paper}>
        <Table className="job-table">
          <TableHead>
            <TableRow>
              <TableCell>Job ID</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Repair Description</TableCell>
              <TableCell>Repair Status</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Handover Date</TableCell>
              <TableCell>Product Image</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.job_id}>
                <TableCell>{job.job_id}</TableCell>
                <TableCell>{job.product_name}</TableCell>
                <TableCell>{job.model}</TableCell>
                <TableCell>{job.repair_description}</TableCell>
                <TableCell>{job.repair_status}</TableCell>
                <TableCell>{job.customer_name}</TableCell>
                <TableCell>{job.handover_date}</TableCell>
                <TableCell>
                  {job.product_image && (
                    <img
                      src={`http://localhost:5000/uploads/${job.product_image}`}
                      alt="Product"
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default JobTable;