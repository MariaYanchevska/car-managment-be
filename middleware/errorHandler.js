const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            error: err.errors.map(e => e.message)
        });
    }

    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            error: 'Referenced record does not exist'
        });
    }

    res.status(500).json({
        error: 'Internal server error'
    });
};

module.exports = errorHandler; 