const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const {
    buildSchema
} = require('graphql')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const app = express()
const port = 3000

const Event = require('./models/event')
const User = require('./models/user')

app.use(bodyParser.json())
app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID!
            email: String!
            password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(event: EventInput): Event 
            createUser(user: UserInput): User
        }

        schema {
            query: RootQuery,
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: async () => {
            try {
                const events = Event.find();
                return events.map(event => {
                    return {
                        ...event._doc,
                        _id: event._doc._id.toString()
                    };
                });
            } catch (err) {
                console.error(err);
                throw err;
            }
        },
        createEvent: async (args) => {
            const event = new Event({
                title: args.event.title,
                description: args.event.description,
                price: +args.event.price,
                date: new Date(args.event.date),
                creator: '5dbec38f7bb7840c70409d02'
            })
            let createdEvent
            return event.save()
                .then(result => {
                    createdEvent = {
                        ...result._doc,
                        _id: result._doc._id.toString()
                    }
                    return User.findById('5dbec38f7bb7840c70409d02')
                })
                .then(user => {
                    if (!user) {
                        throw new Error('User not found')
                    }
                    user.createdEvents.push(event)
                    return user.save()
                })
                .then(result => {
                    return createdEvent
                })
                .catch(err => {
                    console.error(err);
                    throw err
                })
        },
        createUser: async (args) => {
            return User.findOne({
                    email: args.user.email
                })
                .then(user => {
                    if (user) {
                        throw new Error("Email already exists");
                    }
                    return bcrypt.hash(args.user.password, 12)
                })
                .then(hashedPassword => {
                    const user = new User({
                        email: args.user.email,
                        password: hashedPassword
                    })
                    return user.save()
                })
                .then(result => {
                    return {
                        ...result._doc,
                        password: null,
                        _id: result._id
                    }
                })
                .catch(err => {
                    throw err
                })
        }
    },
    graphiql: true
}))
mongoose.connect(
    // `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0-mwlnw.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
    `mongodb://localhost:27017/events`
).then(() => {
    app.listen(port)
}).catch((err) => {
    console.error(err);
    throw err
})