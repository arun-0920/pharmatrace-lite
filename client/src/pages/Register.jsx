import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    batch_number: '',
    medicine_name: '',
    manufacturer: '',
    manufacturing_date: '',
    expiry_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [generatedQR, setGeneratedQR] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axios.post('/api/batches', formData);
      setSuccess('Medicine batch registered successfully!');
      setGeneratedQR(response.data.batch_number);
      setFormData({
        batch_number: '',
        medicine_name: '',
        manufacturer: '',
        manufacturing_date: '',
        expiry_date: ''
      });
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to register batch. Batch number may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const getQRCodeURL = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${generatedQR}`;
  };

  return (
    <div className="register-container">
      <h2>Register New Medicine Batch</h2>
      <p>Enter details to create a new batch and generate QR code</p>
      
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label>Batch Number *</label>
          <input
            type="text"
            name="batch_number"
            value={formData.batch_number}
            onChange={handleChange}
            required
            placeholder="e.g., BATCH003"
          />
        </div>
        
        <div className="form-group">
          <label>Medicine Name *</label>
          <input
            type="text"
            name="medicine_name"
            value={formData.medicine_name}
            onChange={handleChange}
            required
            placeholder="e.g., Paracetamol 500mg"
          />
        </div>
        
        <div className="form-group">
          <label>Manufacturer *</label>
          <input
            type="text"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            required
            placeholder="e.g., ABC Pharmaceuticals"
          />
        </div>
        
        <div className="form-group">
          <label>Manufacturing Date *</label>
          <input
            type="date"
            name="manufacturing_date"
            value={formData.manufacturing_date}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Expiry Date *</label>
          <input
            type="date"
            name="expiry_date"
            value={formData.expiry_date}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register Batch'}
        </button>
      </form>
      
      {success && (
        <div className="success-message">
          <p>{success}</p>
          {generatedQR && (
            <div className="qr-code">
              <h4>QR Code for Batch: {generatedQR}</h4>
              <img src={getQRCodeURL()} alt="QR Code" />
              <p className="qr-instruction">
                Print this QR code and paste it on medicine boxes of batch {generatedQR}
              </p>
              <button 
                onClick={() => window.print()} 
                className="btn-print"
              >
                🖨️ Print QR Code
              </button>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

export default Register;