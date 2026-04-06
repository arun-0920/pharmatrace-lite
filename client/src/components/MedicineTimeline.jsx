import React from 'react';
import './MedicineTimeline.css';

function MedicineTimeline({ batch, events }) {
  const requiredSteps = ['manufacturer', 'warehouse', 'distributor', 'pharmacy'];
  const existingSteps = events.map(e => e.location_type);
  const hasAllSteps = requiredSteps.every(step => existingSteps.includes(step));

  const getStepIcon = (step) => {
    const icons = {
      manufacturer: '🏭',
      warehouse: '📦',
      distributor: '🚚',
      pharmacy: '💊',
      patient: '🧑'
    };
    return icons[step] || '📍';
  };

  const getStepName = (step) => {
    const names = {
      manufacturer: 'Manufacturer',
      warehouse: 'Warehouse',
      distributor: 'Distributor',
      pharmacy: 'Pharmacy',
      patient: 'Patient'
    };
    return names[step] || step;
  };

  return (
    <div className="timeline-container">
      <div className={`status-banner ${hasAllSteps ? 'authentic' : 'fake'}`}>
        {hasAllSteps ? (
          <div className="authentic">
            <span className="icon">✅</span>
            <span className="text">AUTHENTIC MEDICINE</span>
          </div>
        ) : (
          <div className="fake">
            <span className="icon">❌</span>
            <span className="text">FAKE MEDICINE DETECTED!</span>
          </div>
        )}
      </div>

      <div className="medicine-info">
        <h2>{batch.medicine_name}</h2>
        <div className="info-grid">
          <div>
            <strong>Batch Number:</strong> {batch.batch_number}
          </div>
          <div>
            <strong>Manufacturer:</strong> {batch.manufacturer}
          </div>
          <div>
            <strong>Manufacturing Date:</strong> {new Date(batch.manufacturing_date).toLocaleDateString()}
          </div>
          <div>
            <strong>Expiry Date:</strong> {new Date(batch.expiry_date).toLocaleDateString()}
          </div>
        </div>
      </div>

      <h3>Medicine Journey</h3>
      <div className="timeline">
        {events.map((event, index) => (
          <div key={index} className="timeline-step">
            <div className="step-icon">
              {getStepIcon(event.location_type)}
            </div>
            <div className="step-content">
              <h4>{getStepName(event.location_type)}</h4>
              <p>{event.location_name}</p>
              <small>Verified by: {event.verified_by}</small>
              <br />
              <small>{new Date(event.event_date).toLocaleString()}</small>
            </div>
          </div>
        ))}
      </div>

      {!hasAllSteps && (
        <div className="warning">
          ⚠️ Warning: This medicine's supply chain is incomplete!<br />
          Missing steps: {requiredSteps.filter(step => !existingSteps.includes(step)).map(s => getStepName(s)).join(', ')}
        </div>
      )}
    </div>
  );
}

export default MedicineTimeline;