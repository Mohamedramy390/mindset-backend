import { body } from 'express-validator';

export const registerValidationRules = [
    // Validate firstName
    body('firstName')
        .isString()
        .notEmpty()
        .withMessage('First name is required'),

    // Validate secondName (optional, remove if not needed)
    body('secondName')
        .isString()
        .notEmpty()
        .withMessage('Second name is required'),

    // Validate email
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address'),
    
    // Validate password
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/\d/)
        .withMessage('Password must contain a number')
        .matches(/[A-Z]/)
        .withMessage('Password must contain an uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain a lowercase letter')
        .matches(/[@$!%*?&]/) // Feel free to adjust special characters
        .withMessage('Password must contain one of these special characters: @$!%*?&'),

    body('role')
        .optional() // Make it optional if it's not always provided
        .isIn(['student', 'teacher']) // Example: restrict to specific roles
        .withMessage('Invalid role'),


    // This part is not strictly necessary as express-validator
    // automatically calls next() if validation passes.
    (req, res, next) => {
        next()
    }
];