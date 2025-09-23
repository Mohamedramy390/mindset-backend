import AppError from "../utils/appError.js"
import { ERROR } from "../utils/httpStatus.js"

export default (role) => {
    return (req, res, next) => {
        if(req.curUser.role === role){
            next()
        }else{
            const e = new AppError("Not allowed", 400, ERROR)
            next(e)
        }
    } 
}

// const { default: AppError } = require("../utils/appError")
// const appaError = require("./appaError")

// module.exports = (...roles) => {

//     return (req, res, next) => {
//         if(!roles.includes(req.curUser.role)){
//             return next(appaError.create("not allowed", 401))
//         }
//         next()
//     }
// }