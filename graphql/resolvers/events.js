const Event = require('../../models/event')
const User = require('../../models/user')
const {
    dateToString
} = require('../../helpers/date')
const {
    transformEvent
} = require('./merge')

module.exports = {
    events: async () => {
        try {
            const events = await Event.find()
            return events.map(event => {
                return transformEvent(event)
            })
        } catch (err) {
            throw err
        }
    },
    createEvent: async (args, req) => {
        if (!req.isAuth) {
            throw new Error("Unauthenticated")
        }
        const event = new Event({
            title: args.event.title,
            description: args.event.description,
            price: +args.event.price,
            date: dateToString(args.event.date),
            creator: req.userId
        })
        try {
            const result = await event.save()
            let createdEvent = transformEvent(result)

            const creator = await User.findById(req.userId)
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
    }
}