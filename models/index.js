const Car = require('./Car');
const Service = require('./Service');
const MaintenanceRequest = require('./MaintenanceRequest');
const CarService = require('./CarService');


Car.belongsToMany(Service, { 
    through: CarService,
    foreignKey: 'carId',
    otherKey: 'garageId',
    as: 'garages'
});

Service.belongsToMany(Car, { 
    through: CarService,
    foreignKey: 'garageId',
    otherKey: 'carId',
    as: 'cars'
});

MaintenanceRequest.belongsTo(Car, {
    foreignKey: 'carId'
});

MaintenanceRequest.belongsTo(Service, {
    foreignKey: 'garageId',
    as: 'garage'
});

Car.hasMany(MaintenanceRequest, {
    foreignKey: 'carId'
});

Service.hasMany(MaintenanceRequest, {
    foreignKey: 'garageId',
    as: 'maintenanceRequests'
});

module.exports = {
    Car,
    Service,
    MaintenanceRequest,
    CarService
}; 