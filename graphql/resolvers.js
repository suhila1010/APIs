const bcrypt = require('bcryptjs')
const User = require('../models/user')

module.exports = {
    createUser: async function ({userInput}, req) {
        // const email = userInput.email

        const existingUser = await User.findOne({email: userInput.email})
        if(existingUser){
            const error = new Error('User exits already!')
            throw error
        }

        const hashedPassword = await bcrypt.hash(userInput.password, 12)
        const user = new User({
            email:userInput.email,
            name:userInput.name,
            password:hashedPassword
        })
        const createdUser = await user.save()

        return {...createdUser, _id: createdUser._id.toString()}
    }
}