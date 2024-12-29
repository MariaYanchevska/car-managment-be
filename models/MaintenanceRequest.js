const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    scheduledDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    serviceType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    carId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'car_id'
    },
    garageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'garage_id'
    }
});

module.exports = MaintenanceRequest; 