const { Service, MaintenanceRequest, Car } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.createService = async (req, res) => {
    try {
        const service = await Service.create({
            name: req.body.name,
            city: req.body.city,
            location: req.body.location,
            capacity: req.body.capacity
        });
        res.status(200).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        await service.update(req.body);
        res.status(200).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        await service.destroy();
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getService = async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.status(200).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllServices = async (req, res) => {
    try {
        const where = {};
        if (req.query.city) {
            where.city = req.query.city;
        }
        const services = await Service.findAll({ where });
        res.status(200).json(services);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getServiceStatistics = async (req, res) => {
    try {
        const { garageId, startDate, endDate } = req.query;
        
        // Validate required parameters
        if (!garageId || !startDate || !endDate) {
            return res.status(400).json({ 
                error: 'Missing required parameters. Need garageId, startDate, and endDate' 
            });
        }

        // Find the garage to get its capacity and associated cars
        const garage = await Service.findByPk(garageId, {
            include: [{
                model: Car,
                as: 'cars'
            }]
        });
        
        if (!garage) {
            return res.status(404).json({ error: 'Garage not found' });
        }

        // Get total cars associated with this garage
        const totalAssociatedCars = garage.cars.length;

        // Get all maintenance requests for this garage in the date range
        const maintenanceRequests = await MaintenanceRequest.findAll({
            where: {
                garageId: garageId,
                scheduledDate: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: [
                'scheduledDate',
                [sequelize.fn('COUNT', sequelize.col('id')), 'requestCount']
            ],
            group: ['scheduledDate'],
            order: [['scheduledDate', 'ASC']]
        });

        // Create a map of date to request count
        const requestsByDate = new Map(
            maintenanceRequests.map(mr => [
                mr.scheduledDate,
                parseInt(mr.get('requestCount'))
            ])
        );

        // Generate all dates in range
        const dates = [];
        let currentDate = new Date(startDate);
        const lastDate = new Date(endDate);

        while (currentDate <= lastDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const requestCount = requestsByDate.get(dateStr) || 0;
            
            dates.push({
                date: dateStr,
                requestCount: requestCount,
                availableCapacity: garage.capacity - requestCount,
                totalAssociatedCars: totalAssociatedCars,
                dailyCapacity: garage.capacity
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        res.status(200).json(dates);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}; 