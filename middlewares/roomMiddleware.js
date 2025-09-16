import { body } from "express-validator";


const addRoomValidation = [
    body('name')
        .isString()
        .notEmpty()
        .withMessage("name is requires"),
    body('topic')
        .isString()
        .notEmpty()
        .withMessage("topic is requires"),
    (req, res, next) => {
        next()
    }
];

export {
    addRoomValidation
}