const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mongoose = require('mongoose')

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const registerUser = async (req, res) => {
    try {
        const Body = req.body
        const { fname, lname, email, phone, password, creditScore } = Body;

        if (!isValidRequestBody(Body)) {
            return res.status(400).send({ status: false, message: "Please provide The Data" });
        }
        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: "Please provide fname" });
        }
        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: "Please provide lname" });
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Please provide Email id" });
        }
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({ status: false, message: `${email} should be a valid email address` })
            return
        }
        const AlreadyUsedEmail = await userModel.findOne({ email });
        if (AlreadyUsedEmail) {
            return res.status(403).send({ status: false, message: "This email Id already in Used" });
        }
        if (phone) {
            // if (!isValid(phone)) {
            //     return res.status(400).send({ status: false, message: "Please provide phone number" });
            // }
            if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)) {
                return res.status(400).send({ status: false, message: `Phone number should be a  valid indian number` });
            }
            const AlreadyUsedPhone = await userModel.findOne({ phone })
            if (AlreadyUsedPhone) {
                return res.status(403).send({ status: false, message: "This phone number already In Used" });
            }
        }
        if (phone === "") {
            return res.status(400).send({ status: false, message: "Please Provide The Phone Number" });
        }
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Please provide password or password field" });
        }
        if (!(/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(password))) {
            res.status(400).send({ status: false, message: `Password length should be A Valid Password And Length Should Be in between 8 to 15 ` });
            return;
        }
        if (creditScore) {
            if (!isValid(creditScore)) {
                return res.status(400).send({ status: false, message: "Please provide A Valid Credit Score" });
            }
            if (creditScore != 500) {
                return res.status(400).send({ status: false, message: "The Credit Score Can Only Be 500" });
            }
        }
        const hash = bcrypt.hashSync(password, saltRounds);
        if (phone) {
            let userregister = { fname, lname, email, phone, password: hash, creditScore }
            const userData = await userModel.create(userregister);
            return res.status(201).send({ status: true, message: 'Success', data: userData });
        }
        // const alreadyUsedPhone = await userModel.findOne({ phone })
        // if (alreadyUsedPhone == null) {
        //     let registeruser = { fname, lname, email, password: hash, creditScore }
        //     const cretaeuserData = await userModel.create(registeruser);
        //     return res.status(201).send({ status: true, message: 'Success', data: cretaeuserData });
        // }
        let registerUser = { fname, lname, email, password: hash, creditScore }
        const CretaeuserData = await userModel.create(registerUser);
        return res.status(201).send({ status: true, message: 'Success', data: CretaeuserData });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const loginUser = async function (req, res) {
    try {
        const body = req.body
        const { email, password } = body
        if (!isValidRequestBody(body)) {
            return res.status(400).send({ status: false, message: "Please provide The Credential To Login" });
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Please provide The Email-id" });
        }
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({ status: false, message: `${email} should be a valid email address` })
            return
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Please provide The password" });;
        }
        if (!(/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(password))) {
            res.status(400).send({ status: false, message: `Password length should be A Valid Password And Length Should Be in between 8 to 15 ` });
            return;
        }
        let user = await userModel.findOne({ email: email });
        if (user) {
            const Passwordmatch = await bcrypt.compareSync(body.password, user.password);
            if (Passwordmatch) {
                const generatedToken = jwt.sign({
                    userId: user._id,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 60 * 180
                }, 'Hritik')

                return res.status(200).send({
                    "status": true,
                    Message: " user loggedIn Succesfully",
                    data: {
                        userId: user._id,
                        token: generatedToken,
                    }
                });
            } else {
                res.status(401).send({ error: "Password Is Wrong" });
            }
        } else {
            return res.status(400).send({ status: false, message: "Invalid credentials" });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const getUser = async (req, res) => {
    try {
        let userId = req.params.userId
        let tokenId = req.userId

        if (!(isValidObjectId(userId))) {
            return res.status(400).send({ status: false, message: "userId is Invalid" });
        }
        if (!(isValid(userId))) {
            return res.status(400).send({ status: false, message: "Provide The UserId" });
        }
        if (!(isValidObjectId(tokenId))) {
            return res.status(400).send({ status: false, message: "Tokenid is Invalid" });
        }
        if (!(isValid(tokenId))) {
            return res.status(400).send({ status: false, message: "Provide The TokenId" });
        }

        let checkData = await userModel.findOne({ _id: userId });
        if (!checkData) {
            return res.status(404).send({ status: false, msg: "There is no user exist with this id" });
        }
        if (!(userId == tokenId)) {
            return res.status(401).send({ status: false, message: `You Are Not Authorized To Perform The Task` });
        }
        return res.status(200).send({ status: true, message: 'Success', data: checkData });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const updateUser = async (req, res) => {
    try {
        let userId = req.params.userId;
        let tokenId = req.userId
        if (!(isValidObjectId(userId))) {
            return res.status(400).send({ status: false, message: "userId is Invalid" });;
        }
        if (!(isValid(userId))) {
            return res.status(400).send({ status: false, message: "Provide The UserId" });;
        }
        if (!(isValidObjectId(tokenId))) {
            return res.status(400).send({ status: false, message: "Tokenid is Invalid" });;
        }
        if (!(isValid(tokenId))) {
            return res.status(400).send({ status: false, message: "Provide The TokenId" });;
        }
        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(404).send({ status: false, message: "User does not exist with this userid" })
        }
        if (!(userId == tokenId)) {
            return res.status(401).send({ status: false, message: `You Are Not Authorized To Perform This Task` });
        }
        let Body = req.body
        if (!isValidRequestBody(Body)) {
            return res.status(400).send({ status: false, message: "Please provide Details To Be Updated Please" });
        }
        const { fname, lname, email, phone } = Body
        let updatedfilter = {}
        if (fname) {
            if (!isValid(fname)) {
                return res.status(400).send({ status: false, message: "Please Provide The First Name" })
            }
            updatedfilter["fname"] = fname
        }
        if (fname === "") {
            return res.status(400).send({ status: false, message: "Please Provide The First Name" })
        }
        if (lname) {
            if (!isValid(lname)) {
                return res.status(400).send({ status: false, message: "Please Provide The Last Name" })
            }
            updatedfilter["lname"] = lname
        }
        if (lname === "") {
            return res.status(400).send({ status: false, message: "Please Provide The Last Name" })
        }
        if (email) {
            if (!isValid(email)) {
                return res.status(400).send({ status: false, message: "Please Provide The Email Adress" })
            }
            if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
                res.status(400).send({ status: false, message: `${email} should be a valid email address` })
                return
            }
            const AlreadyUsedEmailId = await userModel.findOne({ email });
            if (AlreadyUsedEmailId) {
                return res.status(403).send({ status: false, message: "This email Id already in Used" });
            }
            updatedfilter["email"] = email
        }
        if (email === "") {
            return res.status(400).send({ status: false, message: "Please Provide The Email Adress" })
        }
        if (phone) {
            if (!isValid(phone)) {
                return res.status(400).send({ status: false, message: "Please Provide The Phone Number" })
            }
            if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)) {
                return res.status(400).send({ status: false, message: `Phone number should be a  valid indian number` });
            }
            const AlreadyUsedPhoneNum = await userModel.findOne({ phone })
            if (AlreadyUsedPhoneNum) {
                return res.status(403).send({ status: false, message: "This phone number already In Used" });
            }
            updatedfilter["phone"] = phone
        }
        if (phone === "") {
            return res.status(400).send({ status: false, message: "Please Provide The Phone Number" })
        }


        let updateProfile = await userModel.findOneAndUpdate({ _id: userId }, updatedfilter, { new: true });
        return res.status(200).send({ status: true, message: "Your Profile Is Updated", data: updateProfile });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = { registerUser, loginUser, getUser, updateUser }
