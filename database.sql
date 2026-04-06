-- =============================================
-- PharmaTrace Database Schema
-- Medicine Journey Tracking System
-- =============================================

-- First, create the database (Run this in pgAdmin)
-- CREATE DATABASE pharmatrace;

-- =============================================
-- TABLE 1: medicine_batches
-- Stores all medicine batch information
-- =============================================

CREATE TABLE IF NOT EXISTS medicine_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_number VARCHAR(50) UNIQUE NOT NULL,
    medicine_name VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    manufacturing_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE 2: supply_chain_events
-- Tracks each step in the medicine journey
-- =============================================

CREATE TABLE IF NOT EXISTS supply_chain_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES medicine_batches(id) ON DELETE CASCADE,
    location_type VARCHAR(50) CHECK (location_type IN ('manufacturer', 'warehouse', 'distributor', 'pharmacy', 'patient')),
    location_name VARCHAR(100) NOT NULL,
    event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE 3: patient_scans
-- Analytics table for tracking patient scans
-- =============================================

CREATE TABLE IF NOT EXISTS patient_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES medicine_batches(id) ON DELETE CASCADE,
    scan_location VARCHAR(100),
    scan_result BOOLEAN,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Insert BATCH001 (Authentic - All 4 steps present)
INSERT INTO medicine_batches (batch_number, medicine_name, manufacturer, manufacturing_date, expiry_date)
VALUES ('BATCH001', 'Paracetamol 500mg', 'ABC Pharmaceuticals', '2024-01-01', '2026-01-01')
ON CONFLICT (batch_number) DO NOTHING;

-- Insert BATCH002 (Fake - Missing warehouse and distributor)
INSERT INTO medicine_batches (batch_number, medicine_name, manufacturer, manufacturing_date, expiry_date)
VALUES ('BATCH002', 'Amoxicillin 250mg', 'XYZ Pharma', '2024-02-15', '2025-02-15')
ON CONFLICT (batch_number) DO NOTHING;

-- =============================================
-- SUPPLY CHAIN EVENTS for BATCH001 (Authentic)
-- =============================================

INSERT INTO supply_chain_events (batch_id, location_type, location_name, verified_by)
SELECT id, 'manufacturer', 'ABC Pharma Factory, Mumbai', 'Dr. Sharma'
FROM medicine_batches WHERE batch_number = 'BATCH001';

INSERT INTO supply_chain_events (batch_id, location_type, location_name, verified_by)
SELECT id, 'warehouse', 'Central Warehouse, Delhi', 'Mr. Kumar'
FROM medicine_batches WHERE batch_number = 'BATCH001';

INSERT INTO supply_chain_events (batch_id, location_type, location_name, verified_by)
SELECT id, 'distributor', 'City Distributors, Bangalore', 'Ms. Reddy'
FROM medicine_batches WHERE batch_number = 'BATCH001';

INSERT INTO supply_chain_events (batch_id, location_type, location_name, verified_by)
SELECT id, 'pharmacy', 'MedPlus Pharmacy, Hyderabad', 'Mr. Singh'
FROM medicine_batches WHERE batch_number = 'BATCH001';

-- =============================================
-- SUPPLY CHAIN EVENTS for BATCH002 (Fake - Missing steps)
-- =============================================

INSERT INTO supply_chain_events (batch_id, location_type, location_name, verified_by)
SELECT id, 'manufacturer', 'XYZ Pharma Factory, Pune', 'Dr. Patil'
FROM medicine_batches WHERE batch_number = 'BATCH002';

INSERT INTO supply_chain_events (batch_id, location_type, location_name, verified_by)
SELECT id, 'pharmacy', 'Local Pharmacy, Mumbai', 'Mr. Shah'
FROM medicine_batches WHERE batch_number = 'BATCH002';

-- =============================================
-- VERIFY DATA WAS INSERTED CORRECTLY
-- =============================================

-- Check batches count (should be 2)
SELECT COUNT(*) as total_batches FROM medicine_batches;

-- Check events count (should be 6 total: 4 for BATCH001, 2 for BATCH002)
SELECT COUNT(*) as total_events FROM supply_chain_events;

-- View complete journey for BATCH001
SELECT 
    mb.batch_number,
    mb.medicine_name,
    sce.location_type,
    sce.location_name,
    sce.event_date,
    sce.verified_by
FROM medicine_batches mb
JOIN supply_chain_events sce ON mb.id = sce.batch_id
WHERE mb.batch_number = 'BATCH001'
ORDER BY sce.event_date;

-- View complete journey for BATCH002
SELECT 
    mb.batch_number,
    mb.medicine_name,
    sce.location_type,
    sce.location_name,
    sce.event_date,
    sce.verified_by
FROM medicine_batches mb
JOIN supply_chain_events sce ON mb.id = sce.batch_id
WHERE mb.batch_number = 'BATCH002'
ORDER BY sce.event_date;

-- =============================================
-- FAKE DETECTION QUERY
-- Shows which medicines are authentic/fake
-- =============================================

SELECT 
    mb.batch_number,
    mb.medicine_name,
    COUNT(DISTINCT sce.location_type) as steps_completed,
    CASE 
        WHEN COUNT(DISTINCT sce.location_type) = 4 THEN '✅ AUTHENTIC'
        ELSE '❌ FAKE - Missing steps'
    END as status,
    STRING_AGG(DISTINCT sce.location_type, ', ') as steps_present
FROM medicine_batches mb
LEFT JOIN supply_chain_events sce ON mb.id = sce.batch_id
GROUP BY mb.id, mb.batch_number, mb.medicine_name;

-- =============================================
-- INDEXES FOR BETTER PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_batches_batch_number ON medicine_batches(batch_number);
CREATE INDEX IF NOT EXISTS idx_events_batch_id ON supply_chain_events(batch_id);
CREATE INDEX IF NOT EXISTS idx_events_location_type ON supply_chain_events(location_type);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON supply_chain_events(event_date);

-- =============================================
-- HELPER QUERIES (Useful for testing)
-- =============================================

-- Delete all data (for resetting)
-- DELETE FROM supply_chain_events;
-- DELETE FROM medicine_batches;

-- Get single batch by number
-- SELECT * FROM medicine_batches WHERE batch_number = 'BATCH001';

-- Get all events for a batch
-- SELECT * FROM supply_chain_events WHERE batch_id = (SELECT id FROM medicine_batches WHERE batch_number = 'BATCH001');