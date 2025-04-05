import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import axios from "axios";

const MyJobs = ({ employeeId }) => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Employee ID in MyJobs:", employeeId); // Debugging
    if (!employeeId) {
      setError("No employee ID provided");
      return;
    }

    const fetchJobs = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/jobs/employee/${employeeId}`
        );
        console.log("Jobs fetched:", response.data); // Debugging
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError(error.response?.data?.message || "Error fetching jobs");
      }
    };

    fetchJobs();
  }, [employeeId]);
  return (
    <Box>
      {/* Fixed Header Section */}
      <Box
        sx={{
          bgcolor: "black",
          color: "white",
          p: 2,
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1000,
        }}
      >
        <Typography variant="h6" sx={{ textAlign: "left", ml: 2 }}>
          MN Electronics
        </Typography>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ mb: 3, fontWeight: "medium" }}
        >
          My Jobs
        </Typography>

        {/* Error Message */}
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* Jobs Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job ID</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Repair Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Handover Date</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Update Used Inventory</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.length > 0 ? (
                jobs.map((job, index) => (
                  <TableRow key={index}>
                    <TableCell>{job.job_id}</TableCell>
                    <TableCell>{job.product_name}</TableCell>
                    <TableCell>{job.model}</TableCell>
                    <TableCell>{`${job.customer_first_name} ${job.customer_last_name}`}</TableCell>
                    <TableCell>{job.repair_description}</TableCell>
                    <TableCell>{job.repair_status}</TableCell>
                    <TableCell>{job.handover_date}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          bgcolor: "black",
                          color: "white",
                          "&:hover": { bgcolor: "#333" },
                        }}
                        onClick={() =>
                          navigate(`/job-used-inventory/${job.job_id}`)
                        } // Navigate to Job Used Inventory page
                      >
                        Update Inventory
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
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
