const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CarService = sequelize.define('CarService', {
    carId: {
        type: DataTypes.INTEGER,
        field: 'car_id',
        references: {
            model: 'Cars',
            key: 'id'
        }
    },
    serviceId: {
        type: DataTypes.INTEGER,
        field: 'service_id',
        references: {
            model: 'Services',
            key: 'id'
        }
    }
}, {
    tableName: 'car_services'
});

module.exports = CarService; 