import jwt from 'jsonwebtoken'
import {ERROR} from '../utils/httpStatus.js'
import AppError from '../utils/appError.js'

const verifyToken = (req ,res, next) => {
    const authHeaders = req.headers['Authorization'] || req.headers['authorization'];
    if(!authHeaders){
        const e = new AppError("token is required", 401, ERROR)
        return next(e)
    }
    const token = authHeaders.split(' ')[1];
    try{
        const curUser = jwt.verify(token, process.env.JWT_KEY);
        req.curUser = curUser;
        next();
    }catch(err){
        const e = new AppError("invalid token", 401, ERROR)
        return next(e)
    }
    
}

export default verifyToken