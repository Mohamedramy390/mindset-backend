
import User from '../models/user.model.js'
import bcrypt from 'bcrypt'
import asyncWrapper from '../middlewares/asyncWrapper.js'
import appError from '../utils/appError.js'
import { ERROR, FAIL, SUCCESS } from '../utils/httpStatus.js'
import generateJWT from '../utils/generateJWT.js'
import AppError from '../utils/appError.js'

const register = asyncWrapper(
    async (req, res, next) => {
        const {firstName , secondName, email, password, role} = req.body;
        const oldUser = await User.findOne({email})
        if(oldUser){
            const err = new AppError("Email already exist", 400, FAIL);
            return next(err);
        }
        const hashedPass = await bcrypt.hash(password, 8);
        const newUser = new User({
            firstName,
            secondName,
            email,
            password: hashedPass,
            role
        })
        const token = generateJWT({email,id:newUser._id,role})
        newUser.token = token
        await newUser.save()

        res.json({status: SUCCESS, data: {user: newUser}});
    }
)

const login = asyncWrapper(
    async (req, res, next) => {
        const {email, password} = req.body
        if(!email || !password){
            const err = new AppError("Email and password is requires", 400, ERROR)
            return next(err)
        }
        const user = await User.findOne({email})
        if(!user){
            const err = new AppError("User not found", 400, ERROR)
            return next(err)
        }
        const matchesPass = await bcrypt.compare(password, user.password);
        if(matchesPass && user){
            const token = await generateJWT({email, id: user._id, role: user.role})
            res.json({status: SUCCESS, data: {token}});
        }else{
            const err = new AppError("Something wrong", 400, ERROR)
            return next(err)
        }
    }
)

export {
    register,
    login,
}