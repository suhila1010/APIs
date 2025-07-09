const express = require('express')
const {body} = require('express-validator')
const router = express.Router()

const User = require('../models/user')

const authRoutes = require('../controllers/auth')

router.put('/signup',[
    body('name').trim().not().isEmpty(),
    body('email').isEmail().withMessage('Please Enter a Valid email.')
    .custom((value, {req}) => {
        return User.findOne({email:value}).then(userDoc =>{
            if(userDoc){
                return Promise.reject('Email Address already exists!')
            }
        })
    })
    .normalizeEmail(),
    body('password').trim().isLength({min:5})

], authRoutes.signup)

router.post('/login',authRoutes.login )

module.exports = router