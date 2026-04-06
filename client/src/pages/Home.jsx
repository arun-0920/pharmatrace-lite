import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="hero">
        <h1>💊 PharmaTrace</h1>
        <p className="tagline">Know Your Medicine's Journey</p>
        <p className="description">
          Scan the QR code on your medicine box to verify its authenticity
          and see its complete journey from manufacturer to pharmacy.
        </p>
        <Link to="/scan" className="cta-button">
          Scan Medicine Now
        </Link>
      </div>
      
      <div className="features">
        <div className="feature">
          <div className="feature-icon">⚡</div>
          <h3>2 Second Scan</h3>
          <p>Instant verification with your phone camera</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🔗</div>
          <h3>Full Journey</h3>
          <p>See every step from lab to pharmacy</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🛡️</div>
          <h3>Fake Detection</h3>
          <p>Immediately detect counterfeit medicines</p>
        </div>
      </div>
      
      <div className="stats">
        <div className="stat">
          <h2>1M+</h2>
          <p>Lives lost yearly to fake medicines</p>
        </div>
        <div className="stat">
          <h2>2s</h2>
          <p>Time to verify authenticity</p>
        </div>
        <div className="stat">
          <h2>100%</h2>
          <p>Transparent supply chain</p>
        </div>
      </div>
    </div>
  );
}

export default Home;