const { MaintenanceRequest, Car, Service } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.createMaintenanceRequest = async (req, res) => {
    try {
        const { scheduledDate, garageId } = req.body;
        
       
        const service = await Service.findByPk(garageId);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const existingRequests = await MaintenanceRequest.count({
            where: {
                garageId,
                scheduledDate
            }
        });

        if (existingRequests >= service.capacity) {
            return res.status(400).json({ error: 'No available slots for this date' });
        }

        const maintenanceRequest = await MaintenanceRequest.create({
            serviceType: req.body.serviceType,
            scheduledDate: req.body.scheduledDate,
            carId: req.body.carId,
            garageId: req.body.garageId
        });
        
        res.status(200).json(maintenanceRequest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateMaintenanceRequest = async (req, res) => {
    try {
        const maintenanceRequest = await MaintenanceRequest.findByPk(req.params.id);
        if (!maintenanceRequest) {
            return res.status(404).json({ error: 'Maintenance request not found' });
        }

        if (req.body.date || req.body.serviceId) {
            const service = await Service.findByPk(req.body.serviceId || maintenanceRequest.serviceId);
            const date = req.body.date || maintenanceRequest.date;

            const existingRequests = await MaintenanceRequest.count({
                where: {
                    serviceId: service.id,
                    date,
                    id: { [Op.ne]: maintenanceRequest.id }
                }
            });

            if (existingRequests >= service.maxCarsPerDay) {
                return res.status(400).json({ error: 'No available slots for this date' });
            }
        }

        await maintenanceRequest.update(req.body);
        res.status(200).json(maintenanceRequest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteMaintenanceRequest = async (req, res) => {
    try {
        const maintenanceRequest = await MaintenanceRequest.findByPk(req.params.id);
        if (!maintenanceRequest) {
            return res.status(404).json({ error: 'Maintenance request not found' });
        }
        await maintenanceRequest.destroy();
        res.status(200).json({ message: 'Maintenance request deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getMaintenanceRequest = async (req, res) => {
    try {
        const maintenanceRequest = await MaintenanceRequest.findByPk(req.params.id, {
            include: [
                {
                    model: Car,
                    include: [{
                        model: Service,
                        as: 'garages'
                    }]
                },
                {
                    model: Service,
                    as: 'garage'
                }
            ]
        });
        if (!maintenanceRequest) {
            return res.status(404).json({ error: 'Maintenance request not found' });
        }
        res.status(200).json(maintenanceRequest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllMaintenanceRequests = async (req, res) => {
    try {
        const { carId, garageId, dateFrom, dateTo } = req.query;
        const where = {};

        if (carId) where.carId = carId;
        if (garageId) where.garageId = garageId;
        if (dateFrom || dateTo) {
            where.scheduledDate = {};
            if (dateFrom) where.scheduledDate[Op.gte] = dateFrom;
            if (dateTo) where.scheduledDate[Op.lte] = dateTo;
        }

        const maintenanceRequests = await MaintenanceRequest.findAll({
            where,
            include: [
                {
                    model: Car,
                    include: [{
                        model: Service,
                        as: 'garages'
                    }]
                },
                {
                    model: Service,
                    as: 'garage'
                }
            ],
            order: [['scheduledDate', 'ASC']]
        });

        res.status(200).json(maintenanceRequests);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getMonthlyStatistics = async (req, res) => {
    try {
        const { garageId, startMonth, endMonth } = req.query;
        if (!startMonth || !endMonth) {
            return res.status(400).json({ error: 'Start and end months are required' });
        }

        const where = {};
        if (garageId) where.garageId = garageId;

        const stats = await MaintenanceRequest.findAll({
            where: {
                ...where,
                scheduledDate: {
                    [Op.between]: [startMonth + '-01', endMonth + '-31']
                }
            },
            attributes: [
                [sequelize.fn('strftime', '%Y-%m', sequelize.col('scheduledDate')), 'month'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: [sequelize.fn('strftime', '%Y-%m', sequelize.col('scheduledDate'))],
            include: [{
                model: Service,
                as: 'garage',
                attributes: []
            }]
        });

        // Generate all months in range
        const allMonths = [];
        let currentMonth = new Date(startMonth + '-01');
        const endDate = new Date(endMonth + '-01');
        
        while (currentMonth <= endDate) {
            const monthStr = currentMonth.toISOString().slice(0, 7);
            allMonths.push({
                month: monthStr,
                count: 0
            });
            currentMonth.setMonth(currentMonth.getMonth() + 1);
        }

        // Merge actual stats with all months
        stats.forEach(stat => {
            const month = allMonths.find(m => m.month === stat.get('month'));
            if (month) {
                month.count = parseInt(stat.get('count'));
            }
        });

        res.status(200).json(allMonths);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getMonthlyRequestsReport = async (req, res) => {
    try {
        const { garageId, startMonth, endMonth } = req.query;

       
        if (!garageId || !startMonth || !endMonth) {
            return res.status(400).json({ 
                error: 'Missing required parameters. Need garageId, startMonth, and endMonth' 
            });
        }

        
        const dateFormatRegex = /^\d{4}-\d{2}$/;
        if (!dateFormatRegex.test(startMonth) || !dateFormatRegex.test(endMonth)) {
            return res.status(400).json({ 
                error: 'Invalid date format. Use YYYY-MM format' 
            });
        }

        
        const garage = await Service.findByPk(garageId);
        if (!garage) {
            return res.status(404).json({ error: 'Garage not found' });
        }

       
        const monthlyData = await MaintenanceRequest.findAll({
            where: {
                garageId,
                scheduledDate: {
                    [Op.between]: [`${startMonth}-01`, `${endMonth}-31`]
                }
            },
            attributes: [
                [sequelize.fn('strftime', '%Y-%m', sequelize.col('scheduledDate')), 'yearMonth'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'requests']
            ],
            group: [sequelize.fn('strftime', '%Y-%m', sequelize.col('scheduledDate'))],
            raw: true
        });

        
        const allMonths = [];
        const startDate = new Date(`${startMonth}-01`);
        const endDate = new Date(`${endMonth}-01`);

        while (startDate <= endDate) {
            const yearMonth = startDate.toISOString().slice(0, 7);
            allMonths.push({
                yearMonth,
                requests: 0
            });
            startDate.setMonth(startDate.getMonth() + 1);
        }

        
        monthlyData.forEach(data => {
            const month = allMonths.find(m => m.yearMonth === data.yearMonth);
            if (month) {
                month.requests = parseInt(data.requests);
            }
        });

        res.status(200).json(allMonths);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}; 