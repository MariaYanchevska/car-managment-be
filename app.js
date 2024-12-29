const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const models = require('./models');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/garages', require('./routes/serviceRoutes'));
app.use('/cars', require('./routes/carRoutes'));
app.use('/maintenance', require('./routes/maintenanceRoutes'));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('Database connection has been established successfully.');
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

startServer(); 