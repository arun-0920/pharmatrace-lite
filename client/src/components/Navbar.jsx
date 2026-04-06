import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          💊 PharmaTrace
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/scan" className="nav-link">Scan Medicine</Link>
          </li>
          <li className="nav-item">
            <Link to="/register" className="nav-link">Register Batch</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;