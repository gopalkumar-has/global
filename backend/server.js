require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// ==========================================
// 1. ROUTES
// ==========================================

const allRoutes = require('./routes');

// New Auto Compound V2 routes
const autoCompoundV2Routes = require('./routes/autoCompoundV2Routes');

// ==========================================
// 2. GLOBAL WEALTH CRON JOBS
// ==========================================

// Existing daily ROI cron
require('./cron/roiCron');

// Existing salary cron
require('./cron/salaryCron');

// New Auto Compound V2 simulation cron
require('./cron/autoCompoundV2Cron');

console.log('Global Wealth cron modules loaded');


const startDemoTopupCron = require("./cron/demoTopupCron");

// ==========================================
// 3. EXPRESS APP
// ==========================================

const app = express();

app.set('trust proxy', true);

// ==========================================
// 4. CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
    // Local development
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://pure.localhost:3000',

    'http://localhost:5000',
    'http://127.0.0.1:5000',

    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://pure.localhost:5173',

    // Global Wealth live domains
    'https://globalwealth.trade',
    'https://www.globalwealth.trade',
    'https://pure.globalwealth.trade',
 
];

app.use(cors({
    origin: function (origin, callback) {

        // Allow requests without browser origin
        if (!origin) {
            return callback(null, true);
        }

        const cleanOrigin = origin.replace(/\/+$/, '');

        if (allowedOrigins.includes(cleanOrigin)) {
            return callback(null, true);
        }

        console.log('Blocked by CORS:', origin);

        return callback(new Error('Not allowed by CORS'));
    },

    credentials: true
}));

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// ==========================================
// 5. API ROUTES
// ==========================================

// Existing project routes
app.use('/api', allRoutes);

// New Auto Compound V2 routes
app.use('/api/auto-compound-v2', autoCompoundV2Routes);

// ==========================================
// 6. HEALTH CHECK
// ==========================================

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Global Wealth API is running',
        database: mongoose.connection.readyState === 1
            ? 'connected'
            : 'disconnected',
        timestamp: new Date()
    });
});

// ==========================================
// 7. API 404 HANDLER
// ==========================================

app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API Route Not Found!'
    });
});

// ==========================================
// 8. FRONTEND SERVING
// ==========================================

if (process.env.NODE_ENV === 'production') {

    // Vite production build directory
    const frontendPath = path.join(
        __dirname,
        '../frontend/dist'
    );

    app.use(express.static(frontendPath));

    app.get(/.*/, (req, res) => {
        res.sendFile(
            path.join(frontendPath, 'index.html')
        );
    });

} else {

    app.get('/', (req, res) => {
        res.send('Global Wealth API is running locally...');
    });

}

// ==========================================
// 9. DATABASE & SERVER START
// ==========================================

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 100,
    serverSelectionTimeoutMS: 15000
})

.then(() => {

    console.log(
        'MongoDB connected successfully for Global Wealth'
    );

        startDemoTopupCron();


    app.listen(PORT, () => {

        console.log(
            `Global Wealth Server running on port ${PORT}`
        );

        console.log(
            `Environment: ${process.env.NODE_ENV || 'development'}`
        );

    });

})

.catch((error) => {

    console.error(
        'Global Wealth MongoDB connection error:',
        error
    );

    process.exit(1);

});