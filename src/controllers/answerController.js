const mongoose = require('mongoose')
const questionModel = require('../models/questionModel')
const userModel = require('../models/userModel')
const answerModel = require('../models/answerModel')

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

//Post Answer
const postanswer = async (req, res) => {
    try {
        const Body = req.body
        let token = req.userId
        if (!isValidRequestBody(Body)) {
            return res.status(400).send({ status: false, message: "Please Provide A valid Data To Cotinue" })
        }
        const { answeredBy, questionId, text } = Body
        if (!isValid(answeredBy)) {
            return res.status(400).send({ status: false, message: "Please Provide The User Id" })
        }
        if (!isValidObjectId(answeredBy)) {
            return res.status(400).send({ status: false, message: "The User Id Is InValid" })
        }
        if (!isValid(questionId)) {
            return res.status(400).send({ status: false, message: "Please Provide The Question Id" })
        }
        if (!isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, message: "The Question Id Is InValid" })
        }
        if (!isValid(text)) {
            return res.status(400).send({ status: false, message: "Please Provide Your Answer For The Question" })
        }
        const find = await userModel.findOne({ _id: answeredBy })
        if (!find) {
            return res.status(404).send({ status: false, message: "Can't Find Any User Who Is Answering" })
        }
        const check = await questionModel.findOne({ _id: questionId, isDeleted: false })
        if (!check) {
            return res.status(404).send({ status: false, message: "Can't Find Any Question Using The Question Id" })
        }
        let userID = check.askedBy
        if (userID == answeredBy) {
            return res.status(401).send({ status: false, message: "You Are Trying To Answer Your Own Question" })
        }
        if (!(token == answeredBy)) {
            return res.status(401).send({ status: false, message: "You Are Not Authorised To Upload A Answer" })
        }
        let answerUser = await userModel.findOne({_id:answeredBy})
        let answerCredit = answerUser.creditScore
        let NewanswerCredit = answerCredit + 200 ;
        let create = await answerModel.create(Body)
        await userModel.findOneAndUpdate({_id:answeredBy},{creditScore:NewanswerCredit})
        return res.status(201).send({ status: true, message: "Your Answer Has Been Submitted", Data: create })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

//Get Answer
const getanswer = async (req, res) => {
    try {
        let question = req.params.questionId
        if (!isValid(question)) {
            return res.status(400).send({ status: false, message: "Please Provide A Valid QuestionId" })
        }
        if (!isValidObjectId(question)) {
            return res.status(400).send({ status: false, message: "The QuestionId Is InValid" })
        }
        let findquestion = await questionModel.findOne({ _id: question, isDeleted: false })
        if (!findquestion) {
            return res.status(404).send({ status: false, message: "Cant Find Any Question Through The Question Id" })
        }
        let findanswer = await answerModel.find({ questionId: question, isDeleted: false })
        if (findanswer.length > 0) {
            let Answer = await answerModel.find({ questionId: question, isDeleted: false }).select({ answeredBy: 1, text: 1 })
            let Question = findquestion.description
            let Details = { Question, QuestionID: question, Answer }
            return res.status(200).send({ status: true, message: "Succeefully Fetched All Details", Details })
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


//Update Answer
const updateanswer = async (req, res) => {
    try {
        let ID = req.params.answerId
        let token = req.userId
        let Body = req.body
        if (!isValid(ID)) {
            return res.status(400).send({ status: false, message: "The Answer Id Is InValid" })
        }
        if (!isValidObjectId(ID)) {
            return res.status(400).send({ status: false, message: "The Answer Id Is Not A Valid ObjectId" })
        }
        if (!isValid(token)) {
            return res.status(400).send({ status: false, message: "The Token Id Is InValid" })
        }
        if (!isValidObjectId(token)) {
            return res.status(400).send({ status: false, message: "The Token Id Is Not A Valid ObjectId" })
        }
        if (!isValidRequestBody(Body)) {
            return res.status(400).send({ status: false, message: "Please Provide The Requird Field To Update" })
        }
        const { text } = Body
        if (!isValid(text)) {
            return res.status(400).send({ status: false, message: "Please Provide Your New Answer For Updation" })
        }
        let found = await answerModel.findOne({ _id: ID, isDeleted: false })
        if (!found) {
            return res.status(404).send({ status: false, message: "The Answer Doesn't Exist" })
        }
        let user = found.answeredBy
        if (token == !user) {
            return res.status(401).send({ status: false, message: "You Are Not Authorized To Perform This Task" })
        }
        let updateanswer = await answerModel.findOneAndUpdate({ _id: ID, isDeleted: false }, { text: text }, { new: true })
        return res.status(200).send({ status: true, message: "Answer Updated Successfully", UpdatedAnswer: updateanswer })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

//Delete Answer
const deleteanswer = async (req, res) => {
    try {
        let ID = req.params.answerId
        let token = req.userId
        if (!isValid(ID)) {
            return res.status(400).send({ status: false, message: "The Answer Id Is InValid" })
        }
        if (!isValidObjectId(ID)) {
            return res.status(400).send({ status: false, message: "The Answer Id Is Not A Valid ObjectId" })
        }
        if (!isValid(token)) {
            return res.status(400).send({ status: false, message: "The Token Id Is InValid" })
        }
        if (!isValidObjectId(token)) {
            return res.status(400).send({ status: false, message: "The Token Id Is Not A Valid ObjectId" })
        }
        let found = await answerModel.findOne({ _id: ID, isDeleted: false })
        if (!found) {
            return res.status(404).send({ status: false, message: "The Answer Doesn't Exist Or Already Been Deleted" })
        }
        let user = found.answeredBy
        if (!(token == user)) {
            return res.status(401).send({ status: false, message: "You Are Not Authorized To Perform This Task" })
        }
        let deleteanswer = await answerModel.findOneAndUpdate({ _id: ID, isDeleted: false }, { isDeleted: true }, { new: true })
        return res.status(200).send({ status: true, message: "Answer Deleted Successfully", DeletedAnswer: deleteanswer })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}



module.exports = { postanswer, getanswer, updateanswer, deleteanswer }