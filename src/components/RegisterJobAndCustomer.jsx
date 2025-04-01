import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Divider,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const RegisterJobAndCustomer = () => {
  const [customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumbers: '',
  });

  const [job, setJob] = useState({
    productName: '',
    modelNumber: '',
    repairDescription: '',
    assignedEmployee: '',
    repairStatus: '',
    handoverDate: '',
  });

  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState('');

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleJobChange = (e) => {
    const { name, value } = e.target;
    setJob((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProductImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic here
    setMessage('Job and customer registered successfully!');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, fontFamily: 'Roboto, sans-serif' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Register a New Job & Customer
      </Typography>

      {/* Bootstrap Row for Layout */}
      <div className="row">
        {/* Customer Information Section */}
        <div className="col-md-5">
          <h4>Customer Information</h4>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search Existing Customer"
            />
            <button className="btn btn-primary">
              <SearchIcon />
            </button>
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>First Name</label>
            <input
              type="text"
              className="form-control"
              name="firstName"
              value={customer.firstName}
              onChange={handleCustomerChange}
              placeholder="Enter first name"
            />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Last Name</label>
            <input
              type="text"
              className="form-control"
              name="lastName"
              value={customer.lastName}
              onChange={handleCustomerChange}
              placeholder="Enter last name"
            />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={customer.email}
              onChange={handleCustomerChange}
              placeholder="Enter email address"
            />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Telephone Number</label>
            <input
              type="text"
              className="form-control"
              name="phoneNumbers"
              value={customer.phoneNumbers}
              onChange={handleCustomerChange}
              placeholder="Enter phone numbers (comma-separated)"
            />
          </div>
          <button className="btn btn-success w-100">Add</button>
        </div>

        {/* Vertical Line */}
        <div className="col-md-1 d-flex justify-content-center">
                    <div
                        style={{
                            borderLeft: '2px solid #ccc',
                            height: '100%',
                        }}
                    ></div>
                </div>

        {/* Job Details Section */}
        <div className="col-md-6">
          <h4>Job Details</h4>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="productName"
                  value={job.productName}
                  onChange={handleJobChange}
                  placeholder="Enter product name"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Model Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="modelNumber"
                  value={job.modelNumber}
                  onChange={handleJobChange}
                  placeholder="Enter model number"
                />
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center mb-3">
            <div
              style={{
                width: '150px',
                height: '150px',
                border: '1px dashed #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Product Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <PhotoCamera sx={{ fontSize: 50, color: '#ccc' }} />
              )}
            </div>
            <label className="btn btn-dark ms-3">
              Upload an Image
              <input
                type="file"
                hidden
                onChange={handleImageChange}
              />
            </label>
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Repair Description</label>
            <textarea
              className="form-control"
              rows="3"
              name="repairDescription"
              value={job.repairDescription}
              onChange={handleJobChange}
              placeholder="Enter repair description"
            ></textarea>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Assigned Employee</label>
                <select
                  className="form-select"
                  name="assignedEmployee"
                  value={job.assignedEmployee}
                  onChange={handleJobChange}
                >
                  <option value="">Select Employee</option>
                  <option value="employee1">Employee 1</option>
                  <option value="employee2">Employee 2</option>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Repair Status</label>
                <select
                  className="form-select"
                  name="repairStatus"
                  value={job.repairStatus}
                  onChange={handleJobChange}
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Handover Date</label>
            <input
              type="date"
              className="form-control"
              name="handoverDate"
              value={job.handoverDate}
              onChange={handleJobChange}
            />
          </div>
        </div>
      </div>

      <hr className="my-4" />

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        <Button
          variant="outlined"
          color="secondary"
          sx={{ color: 'red', borderColor: 'red', '&:hover': { backgroundColor: '#ffe6e6' } }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          sx={{ backgroundColor: '#003366', color: '#fff', '&:hover': { backgroundColor: '#002244' } }}
          onClick={handleSubmit}
        >
          Register
        </Button>
      </Box>

      {message && (
        <Typography color="success" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Container>
  );
};

export default RegisterJobAndCustomer;