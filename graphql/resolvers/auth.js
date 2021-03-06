const bcrypt = require('bcryptjs')
const User = require('../../models/user')

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
    }
}