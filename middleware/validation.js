const Joi = require('joi');

const serviceSchema = Joi.object({
    name: Joi.string().required(),
    city: Joi.string().required(),
    location: Joi.string().required(),
    capacity: Joi.number().integer().min(1).required()
});

const carCreateSchema = Joi.object({
    make: Joi.string().required(),
    model: Joi.string().required(),
    productionYear: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
    licensePlate: Joi.string().required(),
    garageIds: Joi.array().items(Joi.number().integer()).optional()
});

const carUpdateSchema = Joi.object({
    make: Joi.string().optional(),
    model: Joi.string().optional(),
    productionYear: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
    licensePlate: Joi.string().optional(),
    garageIds: Joi.array().items(Joi.number().integer()).optional(),
    id: Joi.number().optional(),
    garages: Joi.array().optional()
});

const maintenanceRequestCreateSchema = Joi.object({
    serviceType: Joi.string().required(),
    scheduledDate: Joi.date().iso().required(),
    garageId: Joi.number().integer().required(),
    carId: Joi.number().integer().required()
});

const maintenanceRequestUpdateSchema = Joi.object({
    serviceType: Joi.string().optional(),
    scheduledDate: Joi.date().iso().optional(),
    garageId: Joi.number().integer().optional(),
    carId: Joi.number().integer().optional(),
    id: Joi.number().optional()
});

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({ errors });
        }
        next();
    };
};

module.exports = {
    validateService: validate(serviceSchema),
    validateCarCreate: validate(carCreateSchema),
    validateCarUpdate: validate(carUpdateSchema),
    validateMaintenanceRequestCreate: validate(maintenanceRequestCreateSchema),
    validateMaintenanceRequestUpdate: validate(maintenanceRequestUpdateSchema)
}; 