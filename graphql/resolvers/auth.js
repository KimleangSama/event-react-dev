const bcrypt = require('bcryptjs')
const User = require('../../models/user')
const jwt = require('jsonwebtoken')

module.exports = {
    createUser: async (args) => {
        try {
            const foundUser = await User.findOne({
                email: args.user.email
            })
            if (foundUser) {
                throw new Error("Email already exists");
            }

            let hashedPassword = await bcrypt.hash(args.user.password, 12)
            const user = new User({
                email: args.user.email,
                password: hashedPassword
            })

            let userSaveResult = await user.save()
            return {
                ...userSaveResult._doc,
                password: null,
                _id: userSaveResult._id
            }
        } catch (err) {
            throw err
        }
    },
    login: async ({
        email,
        password
    }) => {
        try {
            const user = await User.findOne({
                email: email
            })
            if (!user) {
                throw new Error("User not found")
            }
            const isEqual = await bcrypt.compare(password, user.password)
            if (!isEqual) {
                throw new Error("Password is incorrect")
            }
            const token = jwt.sign({
                userId: user.id,
                email: user.email
            }, 'somesupersecretkey', {
                expiresIn: '1h'
            })
            return {
                userId: user.id,
                token: token,
                tokenExpiration: 1
            }
        } catch (err) {
            throw err
        }
    }
}