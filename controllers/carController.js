const { Car, Service } = require('../models');
const { Op } = require('sequelize');

exports.createCar = async (req, res) => {
    try {
        const car = await Car.create({
            make: req.body.make,
            model: req.body.model,
            productionYear: req.body.productionYear,
            licensePlate: req.body.licensePlate
        });
        
        if (req.body.garageIds && req.body.garageIds.length > 0) {
           
            const garages = await Service.findAll({
                where: {
                    id: {
                        [Op.in]: req.body.garageIds
                    }
                }
            });

            if (garages.length !== req.body.garageIds.length) {
                await car.destroy();
                return res.status(400).json({ error: 'One or more garages not found' });
            }

           
            await Promise.all(garages.map(async (garage) => {
                if (garage.capacity <= 0) {
                    throw new Error(`Garage ${garage.name} is at full capacity`);
                }
                await garage.update({ capacity: garage.capacity - 1 });
            }));

            await car.setGarages(req.body.garageIds);
        }
        
       
        const carWithGarages = await Car.findByPk(car.id, {
            include: [{
                model: Service,
                as: 'garages'
            }]
        });
        
        res.status(200).json(carWithGarages);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'License plate already exists' });
        }
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(400).json({ error: error.message });
    }
};

exports.getAllCars = async (req, res) => {
    try {
        const { make, garageId, yearFrom, yearTo } = req.query;
        const where = {};
        const include = [{
            model: Service,
            as: 'garages'
        }];

        if (make) {
            where.make = make;
        }

        if (yearFrom || yearTo) {
            where.productionYear = {};
            if (yearFrom) where.productionYear[Op.gte] = parseInt(yearFrom);
            if (yearTo) where.productionYear[Op.lte] = parseInt(yearTo);
        }

        if (garageId) {
            include[0].where = { id: garageId };
            include[0].required = true;
        }

        const cars = await Car.findAll({
            where,
            include,
            order: [['id', 'ASC']]
        });

        res.status(200).json(cars);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getCar = async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id, {
            include: [{
                model: Service,
                as: 'garages'
            }]
        });
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }
        res.status(200).json(car);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateCar = async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id, {
            include: [{
                model: Service,
                as: 'garages'
            }]
        });
        
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }
        
        const { id, garages, garageIds, ...carData } = req.body;
        await car.update(carData);
        
        const newGarageIds = garageIds || (garages && garages.map(g => g.id));
        
        if (newGarageIds) {
           
            const currentGarageIds = car.garages.map(g => g.id);
            
           
            const garagesToAdd = newGarageIds.filter(id => !currentGarageIds.includes(id));
            const garagesToRemove = currentGarageIds.filter(id => !newGarageIds.includes(id));
            
            
            if (garagesToAdd.length > 0) {
                const newGarages = await Service.findAll({
                    where: { id: { [Op.in]: garagesToAdd } }
                });
                
                await Promise.all(newGarages.map(async (garage) => {
                    if (garage.capacity <= 0) {
                        throw new Error(`Garage ${garage.name} is at full capacity`);
                    }
                    await garage.update({ capacity: garage.capacity - 1 });
                }));
            }
            
           
            if (garagesToRemove.length > 0) {
                const removedGarages = await Service.findAll({
                    where: { id: { [Op.in]: garagesToRemove } }
                });
                
                await Promise.all(removedGarages.map(async (garage) => {
                    await garage.update({ capacity: garage.capacity + 1 });
                }));
            }

            await car.setGarages(newGarageIds);
        }
        
        
        const updatedCar = await Car.findByPk(car.id, {
            include: [{
                model: Service,
                as: 'garages'
            }]
        });
        
        res.status(200).json(updatedCar);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'License plate already exists' });
        }
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(400).json({ error: error.message });
    }
};

exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id, {
            include: [{
                model: Service,
                as: 'garages'
            }]
        });
        
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }

        
        await Promise.all(car.garages.map(async (garage) => {
            await garage.update({ capacity: garage.capacity + 1 });
        }));

        await car.destroy();
        res.status(200).json({ message: 'Car deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}; 