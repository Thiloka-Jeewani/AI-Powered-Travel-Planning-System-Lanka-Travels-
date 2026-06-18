const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            errors: errors.array() 
        });
    }
    next();
};

const destinationValidation = [
    body('destination_name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Destination name must be between 2 and 100 characters'),
    body('type')
        .isIn(['cultural', 'beach', 'adventure', 'wildlife', 'city', 'hill_country', 'historical'])
        .withMessage('Invalid destination type'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    body('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    handleValidationErrors
];

const hotelValidation = [
    body('hotel_name')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Hotel name must be between 2 and 255 characters'),
    body('destination_id')
        .notEmpty()
        .withMessage('Destination ID is required'),
    body('type')
        .isIn(['economic', 'boutique_villa', '3_star_standard', '4_star_superior', '5_star_deluxe', 'luxury_boutique_villa'])
        .withMessage('Invalid hotel type'),
    body('price_per_night_usd')
        .isFloat({ min: 0, max: 10000 })
        .withMessage('Price must be between 0 and 10000'),
    body('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    handleValidationErrors
];

const packageValidation = [
    body('package_name')
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage('Package name must be between 5 and 255 characters'),
    body('duration_days')
        .isInt({ min: 1, max: 30 })
        .withMessage('Duration must be between 1 and 30 days'),
    body('price_per_person_usd')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    handleValidationErrors
];

module.exports = {
    destinationValidation,
    hotelValidation,
    packageValidation,
    handleValidationErrors
};
