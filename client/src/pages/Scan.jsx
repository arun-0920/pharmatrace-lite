import React, { useState } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import MedicineTimeline from '../components/MedicineTimeline';
import './Scan.css';

function Scan() {
  const [batchNumber, setBatchNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [medicineData, setMedicineData] = useState(null);
  const [error, setError] = useState(null);
  const [scanMode, setScanMode] = useState('manual'); // 'manual' or 'camera'
  const [scanner, setScanner] = useState(null);

  // Initialize scanner when camera mode is selected
  React.useEffect(() => {
    if (scanMode === 'camera' && !scanner) {
      const html5QrScanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );
      
      html5QrScanner.render(onScanSuccess, onScanError);
      setScanner(html5QrScanner);
    }
    
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanMode]);

  const onScanSuccess = async (decodedText) => {
    // Stop scanning after success
    if (scanner) {
      scanner.clear();
    }
    
    // Set the batch number and verify
    setBatchNumber(decodedText);
    await verifyBatch(decodedText);
  };

  const onScanError = (errorMessage) => {
    console.error('QR Scan Error:', errorMessage);
  };

  const verifyBatch = async (batch) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/track/${batch}`);
      setMedicineData(response.data);
    } catch (err) {
      console.error('Error:', err);
      setError('Medicine not found. Please check the batch number.');
      setMedicineData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!batchNumber.trim()) return;
    await verifyBatch(batchNumber);
  };

  const handleNewScan = () => {
    setMedicineData(null);
    setBatchNumber('');
    setError(null);
    setScanMode('manual');
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
  };

  const switchToCamera = () => {
    setScanMode('camera');
    setMedicineData(null);
    setBatchNumber('');
    setError(null);
  };

  const switchToManual = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setScanMode('manual');
  };

  return (
    <div className="scan-container">
      <h2>Verify Medicine</h2>
      <p>Scan QR code or enter batch number to verify authenticity</p>
      
      {/* Mode Toggle Buttons */}
      <div className="mode-buttons">
        <button 
          className={`mode-btn ${scanMode === 'manual' ? 'active' : ''}`}
          onClick={switchToManual}
        >
          ⌨️ Enter Batch Number
        </button>
        <button 
          className={`mode-btn ${scanMode === 'camera' ? 'active' : ''}`}
          onClick={switchToCamera}
        >
          📷 Scan QR Code
        </button>
      </div>
      
      {/* Manual Entry Mode */}
      {scanMode === 'manual' && (
        <form onSubmit={handleSubmit} className="scan-form">
          <input
            type="text"
            placeholder="Enter Batch Number (e.g., BATCH001)"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            className="batch-input"
          />
          <button type="submit" className="btn-verify" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Medicine'}
          </button>
        </form>
      )}
      
      {/* Camera QR Scanner Mode */}
      {scanMode === 'camera' && (
        <div className="camera-container">
          <div id="qr-reader" style={{ width: '100%' }}></div>
          <p className="camera-hint">
            Point camera at QR code on medicine box
          </p>
          <button onClick={switchToManual} className="btn-secondary">
            Switch to Manual Entry
          </button>
        </div>
      )}
      
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Verifying medicine...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <p style={{ fontSize: '12px', marginTop: '5px' }}>
            Try: BATCH001, BATCH002
          </p>
          <button onClick={handleNewScan} className="btn-new">
            Try Again
          </button>
        </div>
      )}
      
      {medicineData && (
        <>
          <button onClick={handleNewScan} className="btn-new">
            Verify Another Medicine
          </button>
          <MedicineTimeline 
            batch={medicineData.batch} 
            events={medicineData.events} 
          />
        </>
      )}
    </div>
  );
}

export default Scan;