const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({

    fname: { type: String, required: true },

    lname: { type: String, required: true },

    email: { type: String, required: true, lowercase: true, unique: true },

    phone: { type: String },

    password: { type: String, required: true },

    creditScore: { type: Number, required: true, default: 500 }

}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)