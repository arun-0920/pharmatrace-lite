# 💊 PharmaTrace - Medicine Journey Tracking System

## From Lab to Patient - 2 Seconds to Verify

### Problem
Counterfeit medicines kill **1 million people annually**. Patients have no way to verify if their medicine is genuine.

### Solution
PharmaTrace allows patients to scan a QR code on their medicine box and see the complete supply chain journey in **2 seconds**.

### Features
- ✅ QR Code Generation for each medicine batch
- ✅ Supply Chain Tracking (Manufacturer → Warehouse → Distributor → Pharmacy)
- ✅ Patient Verification via QR scan
- ✅ Instant Fake Medicine Detection
- ✅ Mobile Responsive Design

### Tech Stack
- **Frontend:** React.js, HTML5, CSS3, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **QR Scanning:** html5-qrcode
- **API Calls:** Axios

### How It Works
1. Manufacturer creates batch → System generates QR code
2. QR code printed on medicine boxes
3. Each handler scans and records their step
4. Patient scans QR code on medicine box
5. System shows complete journey
6. Missing steps = Fake medicine alert

### Installation

#### Prerequisites
- Node.js (v14+)
- PostgreSQL (v14+)

#### Backend Setup
cd server
npm install
npm run dev

#### frontend Setup
cd client
npm install
npm start
#### Database Setup
Create database in pgAdmin: pharmatrace

Run the SQL commands from database.sql