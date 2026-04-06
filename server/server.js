// Load environment variables from .env file (MUST be at the top)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ============= API ENDPOINTS =============

// 1. GET /api/batches - Get all medicine batches
app.get('/api/batches', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM medicine_batches ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching batches:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 2. GET /api/track/:batchNumber - Get complete journey for a batch
app.get('/api/track/:batchNumber', async (req, res) => {
    try {
        const { batchNumber } = req.params;
        
        // Get batch details
        const batchResult = await pool.query(
            'SELECT * FROM medicine_batches WHERE batch_number = $1',
            [batchNumber]
        );
        
        if (batchResult.rows.length === 0) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        
        const batch = batchResult.rows[0];
        
        // Get all supply chain events for this batch
        const eventsResult = await pool.query(
            'SELECT * FROM supply_chain_events WHERE batch_id = $1 ORDER BY event_date ASC',
            [batch.id]
        );
        
        res.json({
            batch: batch,
            events: eventsResult.rows
        });
    } catch (error) {
        console.error('Error tracking batch:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. POST /api/batches - Create new medicine batch
app.post('/api/batches', async (req, res) => {
    try {
        const { batch_number, medicine_name, manufacturer, manufacturing_date, expiry_date } = req.body;
        
        // Check if batch already exists
        const existingBatch = await pool.query(
            'SELECT * FROM medicine_batches WHERE batch_number = $1',
            [batch_number]
        );
        
        if (existingBatch.rows.length > 0) {
            return res.status(400).json({ error: 'Batch number already exists' });
        }
        
        const result = await pool.query(
            'INSERT INTO medicine_batches (batch_number, medicine_name, manufacturer, manufacturing_date, expiry_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [batch_number, medicine_name, manufacturer, manufacturing_date, expiry_date]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating batch:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 4. POST /api/events - Add supply chain event
app.post('/api/events', async (req, res) => {
    try {
        const { batch_id, location_type, location_name, verified_by } = req.body;
        
        // Validate location_type
        const validTypes = ['manufacturer', 'warehouse', 'distributor', 'pharmacy', 'patient'];
        if (!validTypes.includes(location_type)) {
            return res.status(400).json({ error: 'Invalid location type' });
        }
        
        // Check if batch exists
        const batchExists = await pool.query(
            'SELECT * FROM medicine_batches WHERE id = $1',
            [batch_id]
        );
        
        if (batchExists.rows.length === 0) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        
        const result = await pool.query(
            'INSERT INTO supply_chain_events (batch_id, location_type, location_name, verified_by) VALUES ($1, $2, $3, $4) RETURNING *',
            [batch_id, location_type, location_name, verified_by]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding event:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 5. GET /api/verify/:batchNumber - Verify authenticity
app.get('/api/verify/:batchNumber', async (req, res) => {
    try {
        const { batchNumber } = req.params;
        
        const requiredSteps = ['manufacturer', 'warehouse', 'distributor', 'pharmacy'];
        
        // Get batch details
        const batchResult = await pool.query(
            'SELECT * FROM medicine_batches WHERE batch_number = $1',
            [batchNumber]
        );
        
        if (batchResult.rows.length === 0) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        
        const batch = batchResult.rows[0];
        
        // Get existing steps
        const eventsResult = await pool.query(
            'SELECT location_type FROM supply_chain_events WHERE batch_id = $1',
            [batch.id]
        );
        
        const existingSteps = eventsResult.rows.map(row => row.location_type);
        const hasAllSteps = requiredSteps.every(step => existingSteps.includes(step));
        const missingSteps = requiredSteps.filter(step => !existingSteps.includes(step));
        
        res.json({
            batch_number: batchNumber,
            medicine_name: batch.medicine_name,
            is_authentic: hasAllSteps,
            missing_steps: missingSteps,
            message: hasAllSteps ? 
                '✅ Medicine is authentic' : 
                `❌ Fake medicine detected! Missing steps: ${missingSteps.join(', ')}`
        });
    } catch (error) {
        console.error('Error verifying batch:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 6. GET /api/events/:batchId - Get all events for a batch
app.get('/api/events/:batchId', async (req, res) => {
    try {
        const { batchId } = req.params;
        
        const result = await pool.query(
            'SELECT * FROM supply_chain_events WHERE batch_id = $1 ORDER BY event_date ASC',
            [batchId]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 7. DELETE /api/batches/:batchNumber - Delete a batch (for testing)
app.delete('/api/batches/:batchNumber', async (req, res) => {
    try {
        const { batchNumber } = req.params;
        
        const result = await pool.query(
            'DELETE FROM medicine_batches WHERE batch_number = $1 RETURNING *',
            [batchNumber]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        
        res.json({ message: 'Batch deleted successfully', batch: result.rows[0] });
    } catch (error) {
        console.error('Error deleting batch:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 8. GET /api/stats - Get statistics
app.get('/api/stats', async (req, res) => {
    try {
        const totalBatches = await pool.query('SELECT COUNT(*) FROM medicine_batches');
        const totalEvents = await pool.query('SELECT COUNT(*) FROM supply_chain_events');
        const authenticBatches = await pool.query(`
            SELECT COUNT(DISTINCT mb.id) 
            FROM medicine_batches mb
            JOIN supply_chain_events sce ON mb.id = sce.batch_id
            WHERE sce.location_type IN ('manufacturer', 'warehouse', 'distributor', 'pharmacy')
            GROUP BY mb.id
            HAVING COUNT(DISTINCT sce.location_type) = 4
        `);
        
        res.json({
            total_batches: parseInt(totalBatches.rows[0].count),
            total_events: parseInt(totalEvents.rows[0].count),
            // Note: authentic count is approximate in this query
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'PharmaTrace API is running',
        version: '1.0.0',
        endpoints: {
            batches: 'GET /api/batches',
            track: 'GET /api/track/:batchNumber',
            verify: 'GET /api/verify/:batchNumber',
            createBatch: 'POST /api/batches',
            addEvent: 'POST /api/events',
            stats: 'GET /api/stats',
            health: 'GET /api/health'
        }
    });
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${process.env.DB_DATABASE || 'pharmatrace'}`);
});