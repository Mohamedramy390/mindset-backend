import mongoose from "mongoose";
import validator from 'validator'
import userRoles from "../utils/userRoles.js";

const {TEACHER, STUDENT} = userRoles;

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true
    },
    lasttName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
        validate: [validator.isEmail, "Email not valid"]
    },
    password:{
        type: String,
        require: true
    },
    role:{
        type: String,
        enum: [TEACHER, STUDENT],
        default: STUDENT,
    },
    token:{
        type: String
    },
    rooms:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
        },
    ]
})

export default mongoose.model('User', userSchema);