
import express from 'express'
import { login, register } from '../controllers/userController.js';
import { registerValidationRules } from '../middlewares/registerValidation.js';

const router = express.Router(); 

router.route('/register')
    .post(registerValidationRules,register)
router.route('/login')
    .post(login)


export default router;