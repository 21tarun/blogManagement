const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken")
const validator = require('validator')
const {isValid}= require('../validators/validation')

//=============================================CREATE AUTHOR==================================================================================================
const createAuthor = async function (req, res) {
    try {
        let data = req.body;
        if (!isValid(data.fname)) return res.status(400).send({ status: false, message: "fname is mandatory or should be valid" });
        if (!isValid(data.lname)) return res.status(400).send({ status: false, message: "lname is mandatory or should be valid" });
        if (!data.title) return res.status(400).send({ status: false, message: "title is necessary" });
        if (!(["Mr", "Mrs", "Miss"].includes(data.title))) return res.status(400).send({ status: false, message: "you can use only Mr, Mrs, Miss" })

        //-------------email validations------------------------------
        if(!isValid(data.email)) return res.status(400).send({status:false,message:"email is mandatory or should be valid"})
        data.email=data.email.toLowerCase()
        if (!validator.isEmail(data.email)) return res.status(400).send({ status: false, message: "please enter valid email address!" })

        let user = await userModel.findOne({ email: data.email })
        if (user) return res.status(400).send({ status: false, message: "email already exist" });

        if (!data.password) return res.status(400).send({ status: false, message: "password is necessary" });
        if (!(data.password.match(/(?=.{8,})/))) return res.status(400).send({ status: false, error: "Password should be of atleast 8 charactors" })
        if (!(data.password.match(/.*[a-zA-Z]/))) return res.status(400).send({ status: false, error: "Password should contain alphabets" })
        if (!(data.password.match(/.*\d/))) return res.status(400).send({ status: false, error: "Password should contain digits" })
        let createdAuthor = await userModel.create(data);
        res.status(201).send({ status: true, data: createdAuthor })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

//===================================================AUTHOR LOG IN===============================================================================
const authorLogin = async function (req, res) {
    try {
        let email = req.body.email;
        let password = req.body.password;
        if (!email) return res.status(400).send({ status: false, error: "UserId missing" });
        if (!password) return res.status(400).send({ status: false, error: "password missing" });
        let validUser = await userModel.findOne({ email: email, password: password })
        if (!validUser) return res.status(401).send({ status: false, message: "Invalid email or password" })
        const token = jwt.sign({ _id: validUser._id }, "Extra Secret String")
        
        res.status(200).send({ status: true, "token": token } )
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.createAuthor = createAuthor;
module.exports.authorLogin = authorLogin;