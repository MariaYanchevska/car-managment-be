const { Service, MaintenanceRequest } = require('../models');
const { Op } = require('sequelize');

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
        const { serviceId, startDate, endDate } = req.query;
        if (!serviceId || !startDate || !endDate) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const service = await Service.findByPk(serviceId);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const stats = await MaintenanceRequest.findAll({
            where: {
                serviceId,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: [
                'date',
                [sequelize.fn('COUNT', sequelize.col('id')), 'requestCount']
            ],
            group: ['date']
        });

        const result = stats.map(stat => ({
            date: stat.date,
            requestCount: stat.get('requestCount'),
            availableCapacity: service.maxCarsPerDay - stat.get('requestCount')
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}; 