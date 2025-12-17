const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize SQLite Database
const db = new sqlite3.Database('./bookings.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        // Create bookings table
        db.run(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                firstName TEXT NOT NULL,
                lastName TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                eventType TEXT NOT NULL,
                eventDate TEXT NOT NULL,
                package TEXT,
                message TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'pending'
            )
        `);
    }
});

// API Routes
// Save booking
app.post('/api/bookings', (req, res) => {
    const { firstName, lastName, email, phone, eventType, eventDate, package: pkg, message } = req.body;
    
    const sql = `INSERT INTO bookings (firstName, lastName, email, phone, eventType, eventDate, package, message) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [firstName, lastName, email, phone, eventType, eventDate, pkg, message], function(err) {
        if (err) {
            console.error('Error saving booking:', err);
            res.status(500).json({ success: false, error: 'Failed to save booking' });
        } else {
            res.json({ success: true, bookingId: this.lastID, message: 'Booking saved successfully!' });
        }
    });
});

// Get all bookings
app.get('/api/bookings', (req, res) => {
    db.all('SELECT * FROM bookings ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ success: false, error: err.message });
        } else {
            res.json({ success: true, bookings: rows });
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

