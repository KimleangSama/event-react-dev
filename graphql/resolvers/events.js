const Event = require('../../models/event')
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
    createEvent: async (args) => {
        const event = new Event({
            title: args.event.title,
            description: args.event.description,
            price: +args.event.price,
            date: dateToString(args.event.date),
            creator: '5dc019dc75b1cb0adee22641'
        })
        try {
            const result = await event.save()
            let createdEvent = transformEvent(result)

            const creator = await User.findById('5dc019dc75b1cb0adee22641')
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