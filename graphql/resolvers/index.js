const bcrypt = require('bcryptjs')
const Event = require('../../models/event')
const User = require('../../models/user')

const events = async eventIds => {
    try {
        const events = await Event.find({
            _id: {
                $in: eventIds
            }
        })
        return events.map(event => {
            return {
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)
            }
        })
    } catch (err) {
        throw err
    }
}

const user = async userId => {
    try {
        const user = await User.findById(userId);
        return {
            ...user._doc,
            _id: user.id,
            createdEvents: events.bind(this, user._doc.createdEvents)
        };
    } catch (err) {
        throw err;
    }
}

module.exports = {
    events: async () => {
        try {
            const events = await Event.find()
            return events.map(event => {
                return {
                    ...event._doc,
                    _id: event._doc._id.toString(),
                    creator: user.bind(this, event._doc.creator)
                }
            })
        } catch (err) {
            throw err
        }
    },
    createEvent: async (args) => {
        const event = new Event({
            title: args.event.title,
            description: args.event.description,
            price: +args.event.price,
            date: new Date(args.event.date),
            creator: '5dbedfc1d0c3042640efda9a'
        })
        try {
            const result = await event.save()
            let createdEvent = {
                ...result._doc,
                _id: result._doc._id.toString(),
                date: new Date(result._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            }
            const creator = await User.findById('5dbedfc1d0c3042640efda9a')
            if (!creator) {
                throw new Error('User not found')
            }
            creator.createdEvents.push(event)
            await creator.save()

            return createdEvent
        } catch (err) {
            console.error(err);
            throw err
        }
    },
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