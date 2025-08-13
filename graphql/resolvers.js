const bcrypt = require('bcryptjs')
const User = require('../models/user')
const Post = require('../models/post')
const validator = require('validator')
const jwt = require('jsonwebtoken')

module.exports = {
    createUser: async function ({userInput}, req) {
        // const email = userInput.email
        const errors = []

        if(!validator.isEmail(userInput.email)){
            errors.push({message:"Email is not valid"})
        }

        if(validator.isEmpty(userInput.password) || !validator.isLength(userInput.password,{min:5} )){
            errors.push({message:"Password is not valid"})
        }

        if(errors.length > 0) {
            const error = new Error('Invalid Input')
            error.data = errors
            error.code = 422
            throw error
        }
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
    },

    login:async function({email, password}){
        const user = await User.findOne({email:email})
        if(!user){
            const error = new Error('User Not Found!')
            error.code = 401
            throw error
        }
        const isEqual = await bcrypt.compare(password, user.password)
        if(!isEqual){
            const error = new Error('Password is incorrect.')
            error.code = 401
            throw error
        }
        const token = jwt.sign({
            userId: user._id.toString(),
            email:user.email
        }, 'somesupersecretsecret', {expiresIn: '1h'})

        return {token:token, userId:user._id.toString()}
    },

    createPost:async function ({postInput}, req){
        if(!req.isAuth){
            const error = new Error('Not authenticated')
            error.code = 401
            throw error
        }
        const errors = []

        if(validator.isEmpty(postInput.title) || !validator.isLength(postInput.title,{min:3} )){
            errors.push({message:"title is not valid"})
        }
        if(validator.isEmpty(postInput.content) || !validator.isLength(postInput.content,{min:5} )){
            errors.push({message:"content is not valid"})
        }

        if(errors.length > 0) {
            const error = new Error('Invalid Input')
            error.data = errors
            error.code = 422
            throw error
        }
        const user = await User.findById(req.userId)
        if(!user){
            const error = new Error('Invalid user')
            error.code = 401
            throw error
        }
        const post = new Post({
            title: postInput.title,
            content:postInput.content,
            imageUrl:postInput.imageUrl,
            creator: user
        })

        const createdPost = await post.save()
        user.posts.push(createdPost)
        await user.save()

        return {
            ...createdPost._doc,
            _id:createdPost._id.toString(),
            createdAt: createdPost.createdAt.toISOString(),
            updatedAt: createdPost.updatedAt.toISOString()
        }
    },

    posts:async function({page}, req) {
        if(!req.isAuth){
            const error = new Error('Not authenticated')
            error.code = 401
            throw error
        }
        if(!page){
            page = 1
        }
        const perPage = 2
        

        const totalPosts = await Post.find().countDocuments()
        const posts = await Post.find().sort({createdAt:-1}).skip((page - 1 ) * perPage).limit(perPage).populate('creator')

        return {
            posts:posts.map(p => {
                return {...p._doc, _id:p._id.toString(),
                    createdAt:p.createdAt.toISOString(),
                    updatedAt:p.updatedAt.toISOString()
                }
            }),
            totalPosts
        }
    },

    post:async function ({id}, req) {
        if(!req.isAuth){
            const error = new Error('Not authenticated')
            error.code = 401
            throw error
        }
        const post = await Post.findById(id).populate('creator')
        if(!post){
            const error = new Error('Post Not Found!')
            error.code = 404
            throw error
        }
        return {
            ...post._doc,
            _id:post._id.toString(),
            createdAt:post.createdAt.toISOString(),
            updatedAt:post.updatedAt.toISOString()
        }
    }

}